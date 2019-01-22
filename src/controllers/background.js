import {EventEmitter} from 'events';
import pump from 'pump';
import Dnode from 'dnode/browser.js';

import AergoClient, { GrpcWebProvider, Amount } from '@herajs/client';
import { createIdentity, identifyFromPrivateKey, signTransaction, hashTransaction } from '@herajs/crypto';
import Store from './store';
import 'whatwg-fetch';
import { DEFAULT_CHAIN, chainProvider } from './chain-provider';

import bs58 from 'bs58';
import { Buffer } from 'buffer';

export function encodeTxHash(bytes) {
    return bs58.encode(Buffer.from(bytes));
}

export function decodeTxHash(bs58string) {
    return bs58.decode(bs58string);
}



class BackgroundController extends EventEmitter {
    constructor() {
        super();
        this.uiState = {
            popupOpen: false
        }
        const provider = new GrpcWebProvider({url: chainProvider(DEFAULT_CHAIN).nodeUrl});
        this.aergo = new AergoClient({}, provider);
        this.store = new Store();
        
        this._stateTimeout = null;
        this.setState('initial');
    }

    /**
     * App states: initial -> active -> inactive -> idle
     * Opening UI switches state to active. Closing UI switches state to inactive.
     * After being inactive for a certain amount of time, switch to idle.
     * @param {string} nextState 
     */
    setState(nextState) {
        if (nextState != 'inactive') {
            if (this._stateTimeout) {
                clearTimeout(this._stateTimeout);
            }
        }
        if (this.state != nextState && nextState == 'inactive') {
            if (this._stateTimeout) {
                clearTimeout(this._stateTimeout);
            }
            this._stateTimeout = setTimeout(() => {
                this.setState('idle');
            }, 60000);
        }
        if (this.state != nextState) {
            console.log(`[state] ${this.state} -> ${nextState}`);
        }
        this.state = nextState;
    }

    isUiOpen() {
        return this.uiState.popupOpen;
    }

    setupCommunication (outStream) {
        // Setup simple async rpc stream to popup
        const dnode = Dnode({
            getBlockchainStatus: async (send) => {
                const status = await this.aergo.blockchain();
                send({
                    blockHeight: status.bestHeight
                });
            },
            getAccounts: async (send) => {
                await this.store.open();
                const accounts = await this.store.accounts.getAll();
                /*
                const addresses = await this.aergo.accounts.get();
                const accounts = await Promise.all(addresses.map(async (address) => {
                    const state = await this.aergo.getState(address);
                    return { address: address.toString(), balance: state.balance.toString() };
                }));
                */
                send(accounts);
            },
            createAccount: async ({ name, password }, send) => {
                const chain = DEFAULT_CHAIN;
                const identity = await createIdentity();
                const createdAddress = identity.address;
                await this.store.open();
                await this.store.accounts.put(createdAddress, {
                    balance: 0,
                    publicKey: identity.publicKey.encodeCompressed(),
                    privateKey: identity.privateKey.toArray(),
                    chain: chain,
                    name: name
                });
                send({address: createdAddress});
            },
            importAccount: async ({ privateKey }, send) => {
                const chain = DEFAULT_CHAIN;
                const identity = identifyFromPrivateKey(privateKey);
                const createdAddress = identity.address;
                await this.store.open();
                await this.store.accounts.put(createdAddress, {
                    balance: 0,
                    publicKey: identity.publicKey.encodeCompressed(),
                    privateKey: identity.privateKey.toArray(),
                    chain: chain,
                    name: name
                });
                send({address: createdAddress});
            },
            sendTransaction: async (tx, send) => {
                await this.store.open();
                const account = await this.store.accounts.get(tx.from);
                const identity = identifyFromPrivateKey(account.data.privateKey);

                const amount = (new Amount(tx.amount)).toUnit('aer');

                tx.nonce = 1 + await this.aergo.getNonce(tx.from); // TODO: check if there's a local, non-confirmed tx
                tx.amount = amount.value.toString();
                tx.sign = await signTransaction(tx, identity.keyPair);
                
                tx.hash = await hashTransaction(tx, 'bytes');
                // TODO: signTransaction only understands unitless number, string, or BigInt for amount
                // but sendSignedTransaction assumes aergo if no unit given
                tx.amount = amount.toString();

                
                try {
                    tx.hash = await this.aergo.sendSignedTransaction(tx);
                    send({ tx });
                } catch(e) {
                    console.error(e);
                    send({ error: ''+e });
                }
            },
            syncAccountTx: async (address, send) => {
                await this.store.open();
                const account = await this.store.accounts.get(address);
                const url = chainProvider(account.data.chain).apiUrl(`/transactions?q=from:${address}%20OR%20to:${address}&sort=blockno:desc`);
                const response = await fetch(url);
                const data = await response.json();
                for (let tx of data.hits) {
                    await this.store.transactions.put(tx.hash, tx.meta);
                    // todo check for duplicates
                }
                const txs = await this.store.transactions.getAll();
                txs.sort((a, b) => -(a.data.blockno - b.data.blockno));
                console.log(txs);
                send(txs);
            },
            syncAccountState: async (address, send) => {
                await this.store.open();
                const account = await this.store.accounts.get(address);
                const state = await this.aergo.getState(address);
                console.log(state);
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
    }
}

export default BackgroundController;