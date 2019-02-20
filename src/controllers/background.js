import extension from 'extensionizer';
import { EventEmitter } from 'events';
import pump from 'pump';
import Dnode from 'dnode/browser.js';

import { Amount } from '@herajs/client';
import {
    createIdentity, identifyFromPrivateKey,
    signTransaction, hashTransaction,
    decryptPrivateKey, encryptPrivateKey,
    encodePrivateKey
} from '@herajs/crypto';
import Store from './store';
import State from './state';
import 'whatwg-fetch';
import { DEFAULT_CHAIN, chainProvider } from './chain-provider';
import TransactionManager from './transactions';
import AccountManager from './accounts';

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
        this.aergo = chainProvider(DEFAULT_CHAIN).nodeClient();
        this.store = new Store();

        this.transactionManager = new TransactionManager(this.store);
        
        this.state = new State();
        this._lockTimeout = null;
        this.lock();

        this.accountManager = new AccountManager(this.store, this.state, this.transactionManager);
    }

    async unlock (password) {
        await this.store.open();
        const encryptedId = await this.store.settings.get('encryptedId');
        try {
            const id = await decryptPrivateKey(encryptedId.data, password);
        } catch (e) {
            throw new Error('invalid passphrase');
        }
            
        this.masterPassword = password;
        this.unlocked = true;
        this.emit('update', { unlocked: true });
        this.keepUnlocked();
        console.log('[lock] unlocked');
    }

    async setupAndUnlock (password) {
        await this.store.open();
        // save extension id encrypted using password for a quick check if password is correct later
        const encryptedId = await encryptPrivateKey(Buffer.from(this.id), password);
        await this.store.settings.put('encryptedId', encryptedId);
        await this.store.settings.put('initialized', true);
        await this.unlock(password);
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

    lock () {
        this.masterPassword = "";
        this.unlocked = false;
        this.emit('update', { unlocked: false });
        console.log('[lock] locked');
    }

    isUiOpen() {
        return this.uiState.popupOpen;
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
                send(this.unlocked);
            },
            reset: async (send) => {
                await this.store.open();
                await this.store.accounts.clear();
                await this.store.transactions.clear();
                await this.store.settings.clear();
                send();
            },
            getBlockchainStatus: async (send) => {
                const status = await this.aergo.blockchain();
                send({
                    blockHeight: status.bestHeight,
                    chainId: DEFAULT_CHAIN
                });
            },
            getAccounts: async (send) => {
                this.keepUnlocked();
                await this.store.open();
                const accounts = await this.store.accounts.getAll();
                send(accounts);
            },
            createAccount: async ({ name }, send) => {
                this.keepUnlocked();
                const chain = DEFAULT_CHAIN;
                const identity = await createIdentity();
                const createdAddress = identity.address;
                await this.store.open();
                await this.store.accounts.put(createdAddress, {
                    balance: '0 aer',
                    publicKey: identity.publicKey.encodeCompressed(),
                    privateKey: await encryptPrivateKey(Buffer.from(identity.privateKey.toArray()), this.masterPassword),
                    chain: chain,
                    name: name
                });
                this.accountManager.startTracking();
                send({address: createdAddress});
            },
            importAccount: async ({ privateKey }, send) => {
                this.keepUnlocked();
                const chain = DEFAULT_CHAIN;
                const identity = identifyFromPrivateKey(privateKey);
                const createdAddress = identity.address;
                await this.store.open();
                await this.store.accounts.put(createdAddress, {
                    balance: '0 aer',
                    publicKey: identity.publicKey.encodeCompressed(),
                    privateKey: await encryptPrivateKey(Buffer.from(identity.privateKey.toArray()), this.masterPassword),
                    chain: chain,
                    name: name
                });
                this.accountManager.startTracking();
                send({address: createdAddress});
            },
            exportAccount: async ({ id, password }, send) => {
                this.keepUnlocked();
                const account = await this.store.accounts.get(id);
                let privateKey;
                try {
                    privateKey = await decryptPrivateKey(account.data.privateKey, this.masterPassword);
                } catch (e) {
                    console.error(e);
                    send({ error: 'Could not decrypt private key. '+e });
                    return;
                }
                const privkeyEncrypted = await encryptPrivateKey(privateKey, password);
                send({privateKey: encodePrivateKey(privkeyEncrypted)});
            },
            sendTransaction: async (tx, send) => {
                this.keepUnlocked();
                await this.store.open();
                const account = await this.store.accounts.get(tx.from);
                let privateKey;
                try {
                    privateKey = await decryptPrivateKey(account.data.privateKey, this.masterPassword);
                } catch (e) {
                    console.error(e);
                    send({ error: 'Could not decrypt private key. '+e });
                    return;
                }
                const identity = identifyFromPrivateKey(privateKey);

                const amount = (new Amount(tx.amount)).toUnit('aer');

                tx.nonce = 1 + await this.aergo.getNonce(tx.from); // TODO: check if there's a local, non-confirmed tx
                tx.amount = amount.value.toString();
                tx.sign = await signTransaction(tx, identity.keyPair);
                
                tx.hash = await hashTransaction(tx, 'bytes');
                // TODO: signTransaction only understands unitless number, string, or BigInt for amount
                // but sendSignedTransaction assumes aergo if no unit given
                tx.amount = amount.toString();

                console.log(tx);

                const encodedHash = encodeTxHash(tx.hash);
                

                try {
                    await this.aergo.sendSignedTransaction(tx);
                    tx.hash = encodedHash;
                    const meta = {
                        ts: (new Date()).toISOString(),
                        blockno: null,
                        from: tx.from,
                        to: tx.to,
                        amount: tx.amount,
                        type: tx.type,
                        status: 'pending'
                    };
                    if (tx.payload.length) {
                        meta.payload0 = ''+tx.payload[0];
                    }
                    await this.store.transactions.put(encodedHash, meta);
                    send({ tx });
                } catch(e) {
                    console.error(e);
                    send({ error: ''+e });
                }
            },
            getAccountTx: async (address, send) => {
                await this.store.open();
                const range =  IDBKeyRange.bound(address, address);
                // get all txs from or to this address
                const txsFrom = await this.store.transactions.getAllIndex('from', range);
                const txsTo = await this.store.transactions.getAllIndex('to', range);
                // unique txs by hash
                const txs = txsFrom.concat(txsTo).filter(function(o) {
                    return this.has(o.hash) ? false : this.add(o.hash);
                }, new Set());
                txs.sort((a, b) => (a.data.ts < b.data.ts ? 1 : (a.data.ts == b.data.ts ? 0 : -1)));
                send(txs);
            },
            syncAccountState: async (address, send) => {
                await this.store.open();
                const account = await this.store.accounts.get(address);
                const state = await this.aergo.getState(address);
                console.log('got new state', address, state);
                account.data.balance = state.balance.toString();
                this.store.accounts.put(address, account.data);
                send(account);
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