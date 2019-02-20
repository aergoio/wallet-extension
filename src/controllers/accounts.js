import 'whatwg-fetch';
import { EventEmitter } from 'events';

class AccountManager extends EventEmitter {
    constructor(store, state, transactionManager) {
        super();
        this.intervals = {};
        this.store = store;
        this.state = state;
        this.transactionManager = transactionManager;
        this.accounts = [];
        this.accountsById = {};
        this.trackedAccounts = [];
        this.initialLoad = false;

        this.state.on('active', () => {
            console.log('became active');
            this.startTracking();
        });

        this.state.on('idle', () => {
            console.log('became idle');
            this.stopTracking();
        });
    }

    async loadFromStore() {
        await this.store.open();
        this.accounts = await this.store.accounts.getAll();
        for (let account of this.accounts) {
            this.accountsById[account.id] = account;
        }
    }

    async startTracking() {
        await this.loadFromStore();
        this.initialLoad = true;
        for (let account of this.accounts) {
            this.transactionManager.trackAccount(account);
        }
        this.trackedAccounts = [...this.accounts];
        console.log(`Tracking ${this.trackedAccounts.length} accounts`);
    }

    async stopTracking() {
        for (let account of this.trackedAccounts) {
            this.transactionManager.stopTrackingAccount(account);
        }
    }
}

export default AccountManager;