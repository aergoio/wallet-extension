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
    encodePrivateKey
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

const AUTO_LOCK_TIMEOUT = 60*1000;

class BackgroundController extends EventEmitter {
    constructor() {
        super();

        this.id = extension.runtime.id;

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
            const customChains = await this.wallet.datastore.getIndex('settings').get('customChains')
            for (let chainId of Object.keys(customChains.data)) {
                this.wallet.useChain({ chainId, nodeUrl: customChains.data[chainId].nodeUrl});
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
                await store.open();
                await store.getIndex('accounts').clear();
                await store.getIndex('transactions').clear();
                await store.getIndex('settings').clear();
                await store.getIndex('keys').clear();
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
            getBlockchainStatus: async (send) => {
                const status = await this.wallet.getClient().blockchain();
                send({
                    blockHeight: status.bestHeight,
                    chainId: this.wallet.defaultChainId
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
                
                const account = await this.wallet.accountManager.createAccount(chainId);
                this.trackAccount(account);
                send(account.data.spec);
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
            exportAccount: async ({ address, chainId, password }, send) => {
                this.keepUnlocked();
                const account = await this.wallet.accountManager.getOrAddAccount({ address, chainId });
                const key = await this.wallet.keyManager.getKey(account);
                console.log(account, key);
                const privateKey = key.data.privateKey;
                /*
                let privateKey;
                try {
                    privateKey = await decryptPrivateKey(account.data.privateKey, this.masterPassword);
                } catch (e) {
                    console.error(e);
                    send({ error: 'Could not decrypt private key. '+e });
                    return;
                }*/
                const privkeyEncrypted = await encryptPrivateKey(privateKey, password);
                send({privateKey: encodePrivateKey(privkeyEncrypted)});
            },
            sendTransaction: async (tx, chainId, send) => {
                this.keepUnlocked();
                try {
                    const txTracker = await this.wallet.sendTransaction({
                        address: tx.from,
                        chainId: chainId
                    }, tx);
                    console.log(txTracker, txTracker.transaction.txBody);
                    send({ tx: txTracker.transaction.txBody });
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
                /*const tracker = await this.wallet.accountManager.trackAccount(accountSpec);
                tracker.once('update', account => {
                    console.log('got new state', account);
                    tracker.pause();
                    send(account);
                });*/
            },
            signMessage: async ({ address, chainId, message }, send) => {
                this.keepUnlocked();
                const account = await this.wallet.accountManager.getOrAddAccount({ address, chainId });
                const signedMessage = await this.wallet.keyManager.signMessage(account, Buffer.from(message));
                send({ signedMessage });
            }
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