import { openDb } from 'idb';

const STORAGE_NAME = 'aergowallet';
const STORAGE_VERSION = 1;

class Index {
    constructor(db, name, keyPath) {
        this.name = name;
        this.db = db;
        this.keyPath = keyPath;
    }
    get(key) {
        return this.db.transaction(this.name).objectStore(this.name).get(key);
    }
    getAll() {
        return this.db.transaction(this.name).objectStore(this.name).getAll();
    }
    put(key, data) {
        const tx = this.db.transaction(this.name, 'readwrite');
        tx.objectStore(this.name).put({
            [this.keyPath]: key,
            data
        });
        return tx.complete;
    }
    delete(key) {
        return this.db.transaction(this.name).objectStore(this.name).delete(key);
    }
}

export default class Store {
    constructor() {
    }
    async open() {
        if (typeof this.db !== 'undefined') return;

        this.db = await openDb(STORAGE_NAME, STORAGE_VERSION, upgradeDB => {
            switch (upgradeDB.oldVersion) {
                case 0:
                    upgradeDB.createObjectStore('tx', {keyPath: 'hash'});
                    upgradeDB.createObjectStore('accounts', {keyPath: 'id'});
            }
        });
        this.transactions = new Index(this.db, 'tx', 'hash');
        this.accounts = new Index(this.db, 'accounts', 'id');
    }
}