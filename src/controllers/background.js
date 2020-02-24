import extension from 'extensionizer';
import { EventEmitter } from 'events';
import pump from 'pump';
import Dnode from 'dnode/browser.js';

import { Wallet } from '@herajs/wallet';
import config from './config';
import store from './store';
import { AergoscanTransactionScanner } from './tx-scanner';

import {
    identifyFromPrivateKey,
    encryptPrivateKey,
    encodePrivateKey,
    keystoreFromPrivateKey,
} from '@herajs/crypto';
import State from './state';
import 'whatwg-fetch';

import bs58 from 'bs58';
import { Buffer } from 'buffer';

export function encodeTxHash(bytes) {
    return bs58.encode(Buffer.from(bytes));
}

export function decodeTxHash(bs58string) {
    return bs58.decode(bs58string);
}

const AUTO_LOCK_TIMEOUT = 60*1000 * 3; // 3 minutes

class BackgroundController extends EventEmitter {
    constructor() {
        super();

        this.id = extension.runtime.id;

        this.requests = {};
        this.lastRequestId = 0;

        this.uiState = {
            popupOpen: false
        }
        this.state = new State();
        this._lockTimeout = null;

        this.wallet = new Wallet({
            appName: 'aergo-browser-wallet',
            instanceId: this.id
        });
        this.wallet.use(AergoscanTransactionScanner);
        this.wallet.useStorage(store).then(async () => {
            this.firstLoad();
            // Load custom defined chains
            try {
                const customChains = await this.wallet.datastore.getIndex('settings').get('customChains')
                for (let chainId of Object.keys(customChains.data)) {
                    this.wallet.useChain({ chainId, nodeUrl: customChains.data[chainId].nodeUrl});
                }
            } catch (e) {
                // not found
            }
        });
        for (let chain of config.chains) {
            this.wallet.useChain(chain);
        }

        this.wallet.keyManager.on('lock', () => {
            this.emit('update', { unlocked: false });
            console.log('[lock] locked');
        });
        this.wallet.keyManager.on('unlock', () => {
            this.emit('update', { unlocked: true });
            console.log('[lock] unlocked');
        });

        this.state.on('idle', () => {
            console.log('[state] idle, pausing trackers');
            this.wallet.accountManager.pause();
            this.wallet.transactionManager.pause();
        });
        this.state.on('active', () => {
            console.log('[state] active, resuming trackers');
            this.wallet.accountManager.resume();
            this.wallet.transactionManager.resume();
        });

        this.lock();
    }

    async firstLoad() {
        const accounts = await this.wallet.accountManager.getAccounts();
        for (let account of accounts) {
            this.trackAccount(account);
        }
    }

    lock () {
        this.wallet.lock();
    }
    
    async unlock (passphrase) {
        await this.wallet.unlock(passphrase);
        this.keepUnlocked();
    }

    async setupAndUnlock (passphrase) {
        await this.wallet.setupAndUnlock(passphrase);
        this.keepUnlocked();
    }

    async setActiveAccount({ chainId, address }) {
        const account = await this.wallet.accountManager.getOrAddAccount({ address, chainId });
        this.activeAccount = account;
        console.log('Active account is now', { chainId, address });
    }

    async getActiveAccount() {
        //const accounts = await this.wallet.accountManager.getAccounts();
        //if (!accounts) return null;
        //return accounts[0];
        return this.activeAccount;
    }

    keepUnlocked() {
        if (this._lockTimeout) {
            clearTimeout(this._lockTimeout);
        }
        this._lockTimeout = setTimeout(() => {
            console.log('[lock] auto-locking...');
            this.lock();
        }, AUTO_LOCK_TIMEOUT);
    }

    isUiOpen() {
        return this.uiState.popupOpen;
    }

    trackAccount(account, onceCb) {
        const accountTracker = this.wallet.accountManager.trackAccount(account);
        this.wallet.transactionManager.trackAccount(account);
        accountTracker.then(t => {
            t.removeAllListeners('update');
            t.on('update', account => {
                console.log('got new state', account);
                this.emit('update', { accounts: [account] });
                if (onceCb) {
                    onceCb(account);
                    onceCb = false;
                }
            });
        });
    }

    permissionRequest(type, data, senderURL, callback, cancelCallback) {
        const requestId = this.lastRequestId++;
        this.requests[requestId] = {
            type,
            data,
            senderURL,
            callback,
            cancelCallback,
        };
        extension.windows.getCurrent((window) => {
            const left = Math.max(0, window.left + window.width - 330);
            extension.windows.create({
                url: chrome.runtime.getURL(`popup-request.html?request=${requestId}`),
                type: "popup",
                width: 330,
                height: 525,
                top: window.top,
                left,
            });
        });
    }

    respondToPermissionRequest (requestId, result, respondCancel = false) {
        const request = this.requests[requestId];
        if (!request) return;
        if (respondCancel) {
            request.cancelCallback({
                error: 'user cancelled request',
            });
            return;
        }
        request.callback(result);
    }

    async signMessage ({ address, chainId, message }) {
        this.keepUnlocked(); 
        const account = await this.wallet.accountManager.getOrAddAccount({ address, chainId });
        return await this.wallet.keyManager.signMessage(account, Buffer.from(message));
    }

    async signTransaction ({ address, chainId, txData }) {
        this.keepUnlocked(); 
        const account = await this.wallet.accountManager.getOrAddAccount({ address, chainId });
        const preparedTxData = await this.wallet.accountManager.prepareTransaction(account, txData);
        return await this.wallet.keyManager.signTransaction(account, preparedTxData);
    }

    async sendTransaction ({ txBody, chainId }) {
        this.keepUnlocked();
        const txTracker = await this.wallet.sendTransaction({
            address: txBody.from,
            chainId: chainId
        }, txBody);
        console.log(txTracker, txTracker.transaction.txBody);
        return txTracker.transaction.txBody;
    }

    setupCommunication (outStream) {
        // Setup async rpc stream to UI
        const dnode = Dnode({
            unlock: async ({ password }, send) => {
                try {
                    await this.unlock(password);
                } catch (e) {
                    console.error(e);
                    send({ error: ''+e });
                    return;
                }
                send({});
            },
            lock: async (send) => {
                this.lock();
                send({});
            },
            setup: async ({ password }, send) => {
                await this.setupAndUnlock(password);
                send({});
            },
            isUnlocked: async (send) => {
                send(this.wallet.unlocked);
            },
            reset: async (send) => {
                await this.wallet.deleteAllData();
                send();
            },
            addNetwork: async ({ chainId, nodeUrl }, send) => {
                console.log('Adding chain', { chainId, nodeUrl });
                this.wallet.useChain({ chainId, nodeUrl });
                let chains = {};
                try {
                    chains = (await this.wallet.datastore.getIndex('settings').get('customChains')).data;
                } catch(e) {
                    // not found
                }
                chains[chainId] = { chainId, nodeUrl };
                await this.wallet.datastore.getIndex('settings').put({
                    key: 'customChains',
                    data: chains
                });
                send({});
            },
            getBlockchainStatus: async ({ chainId }, send) => {
                const status = await this.wallet.getClient(chainId).blockchain();
                send({
                    blockHeight: status.bestHeight,
                    chainId
                });
            },
            getAccounts: async (send) => {
                this.keepUnlocked();
                const accounts = await this.wallet.accountManager.getAccounts();
                for (let account of accounts) {
                    this.trackAccount(account);
                }
                send(accounts);
            },
            createAccount: async ({ chainId }, send) => {
                this.keepUnlocked();
                
                try {
                    const account = await this.wallet.accountManager.createAccount(chainId);
                    this.trackAccount(account);
                    send(account.data.spec);
                } catch(e) {
                    send({error: e});
                }
            },
            removeAccount: async ({ chainId, address }, send) => {
                await this.wallet.accountManager.removeAccount({ chainId, address });
                send();
            },
            setActiveAccount: async ({ chainId, address }, send) => {
                await this.setActiveAccount({ chainId, address });
                send();
            },
            getActiveAccount: async (send) => {
                const account = await this.getActiveAccount();
                send(account);
            },
            importAccount: async ({ privateKey, chainId }, send) => {
                this.keepUnlocked();
                const identity = identifyFromPrivateKey(privateKey);
                const address = identity.address;
                try {
                    const account = await this.wallet.accountManager.addAccount({ address, chainId });
                    console.log('importAccount', account, privateKey);
                    await this.wallet.keyManager.importKey({
                        account: account,
                        privateKey: privateKey
                    });
                    this.trackAccount(account);
                    send(account.data.spec);
                } catch(e) {
                    console.error(e);
                    send({ error: 'Could not import account. '+e });
                }
            },
            exportAccount: async ({ address, chainId, password, format }, send) => {
                this.keepUnlocked();
                const account = await this.wallet.accountManager.getOrAddAccount({ address, chainId });
                const key = await this.wallet.keyManager.getUnlockedKey(account);
                console.log(account, key);
                const privateKey = key.data.privateKey;
                let privkeyEncrypted;
                if (format === "wif") {
                    privkeyEncrypted = encodePrivateKey(await encryptPrivateKey(privateKey, password));
                } else {
                    privkeyEncrypted = JSON.stringify(await keystoreFromPrivateKey(Buffer.from(privateKey), password));
                }
                send({privateKey: privkeyEncrypted});
            },
            sendTransaction: async (tx, chainId, send) => {
                try {
                    const txBody = await this.sendTransaction({ txBody: tx, chainId });
                    send({ tx: txBody });
                } catch(e) {
                    console.error(e);
                    send({ error: e.message || ''+e });
                }
            },
            signTransaction: async (tx, chainId, send) => {
                try {
                    const txBody = await this.signTransaction({ txData: tx, address: tx.from, chainId });
                    send({ tx: txBody });
                } catch(e) {
                    console.error(e);
                    send({ error: e.message || ''+e });
                }
            },
            getAccountTx: async (accountSpec, send) => {
                console.log('getAccountTx', accountSpec);
                if (!accountSpec.address) return send({});
                const txs = await this.wallet.transactionManager.getAccountTransactions(accountSpec);
                txs.sort((a, b) => (a.data.ts < b.data.ts ? 1 : (a.data.ts == b.data.ts ? 0 : -1)));
                send(txs);
            },
            syncAccountState: async (accountSpec, send) => {
                if (!accountSpec.address) return send({});
                const account = await this.wallet.accountManager.getOrAddAccount(accountSpec);
                this.trackAccount(account, send);
            },
            signMessage: async ({ address, chainId, message }, send) => {
                try {
                    const signedMessage = await this.signMessage({ address, chainId, message });
                    send({ signedMessage });
                } catch (e) {
                    console.error(e);
                    send({ error: e });
                }
            },
            getStaking: async ({ address, chainId }, send) => {
                this.keepUnlocked();
                try {
                    const result = await this.wallet.getClient(chainId).getStaking(address);
                    send({
                        amount: result.amount.toString(),
                        when: result.when
                    });
                } catch(e) {
                    send({ error: e });
                }
            },
            getPermissionRequestData: async (requestId, send) => {
                send(this.requests[requestId]);
            },
            respondToPermissionRequest: async ({ requestId, result }, send) =>{
                this.respondToPermissionRequest(requestId, result);
                send();
            },
            denyPermissionRequest: async (requestId, send) => {
                if (this.requests[requestId]) {
                    this.respondToPermissionRequest(requestId, null, true);
                    delete this.requests[requestId];
                }
                send();
            },
            getChainInfo: async ({ chainId }, send) => {
                const chainInfo = await this.wallet.getClient(chainId).getChainInfo();
                send({ chainInfo: JSON.parse(JSON.stringify(chainInfo)) });
            },
        })
        pump(
            outStream,
            dnode,
            outStream,
            (err) => {
                if (err) log.error(err);
            }
        );
        dnode.on('remote', (remote) => {
            const sendUpdate = remote.sendUpdate.bind(remote);
            this.on('update', sendUpdate)
        });

        /*setInterval(() => {
            this.emit('update', 'something');
        }, 1000)*/
        this.state.on('change', (state) => {
            this.emit('update', { state });
        });
    }
}

export default BackgroundController;