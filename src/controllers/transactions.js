import 'whatwg-fetch';
import { EventEmitter } from 'events';
import { DEFAULT_CHAIN, chainProvider } from './chain-provider';

const SYNC_INTERVAL = 15 * 1000;

class TransactionManager extends EventEmitter {
    constructor(store) {
        super();
        this.intervals = {};
        this.store = store;
        this.lastBlockPromise = {};
    }

    async _getTransactionsSince(account, blockno, size=100, offset=0) {
        console.log(`Getting txs for ${account.id} since ${blockno}...`);
        const q = encodeURIComponent(`(from:${account.id} OR to:${account.id}) AND blockno:>${blockno}`);
        const url = chainProvider(account.data.chain).apiUrl(`/transactions?q=${q}&sort=blockno:desc&size=${size}&from=${offset}`);
        const response = await fetch(url);
        const data = await response.json();
        console.log(`Got ${data.hits.length} (of ${data.total}) txs for ${account.id} since ${blockno}.`);
        return data.hits;
    }

    async _getBestBlock(account) {
        if (this.lastBlockPromise[account.data.chain]) return await this.lastBlockPromise[account.data.chain];
        this.lastBlockPromise[account.data.chain] = new Promise(async (resolve) => {
            const url = chainProvider(account.data.chain).apiUrl(`/bestBlock`);
            const response = await fetch(url);
            const bestBlock = await response.json();
            resolve(bestBlock);
        });
        const result = await this.lastBlockPromise[account.data.chain];
        this.lastBlockPromise[account.data.chain] = null;
        return result;
    }

    /**
     * Start tracking an account for transactions using remote API
     * @param {*} account 
     */
    trackAccount(account) {
        if (typeof this.intervals[account.id] !== 'undefined' && this.intervals[account.id] !== null) {
            this.stopTrackingAccount(account);
        }
        let initialSyncDone = false;
        const sync = async () => {
            await this.store.open();
            let lastBlockno = 0;
            try {
                lastBlockno = account.data.lastSync.blockno;
            } catch(e) {}
            const txs = await this._getTransactionsSince(account, lastBlockno);
            await Promise.all(txs.map(tx => this.store.transactions.put(tx.hash, tx.meta)));
            const bestBlock = await this._getBestBlock(account);
            account.data.lastSync = {
                blockno: bestBlock.meta.no,
                time: bestBlock.meta.ts
            }
            if (txs.length > 0 || !initialSyncDone) {
                // new tx, update account state
                const state = await chainProvider(account.data.chain).nodeClient().getState(account.id);
                account.data.balance = state.balance.toString();
                initialSyncDone = true;
            }
            console.log(`[${account.id}] Saved ${txs.length} new txs, balance is ${account.data.balance}.`);
            await this.store.accounts.put(account.id, account.data);
        };
        this.intervals[account.id] = setInterval(sync, SYNC_INTERVAL);
        sync();
    }
    /**
     * Stop tracking an address for transactions
     * @param {*} address 
     */
    stopTrackingAccount(account) {
        clearInterval(this.intervals[account.id]);
        this.intervals[account.id] = null;
    }
}

export default TransactionManager;