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
    getAllIndex(indexName, range) {
        return this.db.transaction(this.name).objectStore(this.name).index(indexName).getAll(range);
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
        return this.db.transaction(this.name, 'readwrite').objectStore(this.name).delete(key);
    }
    clear() {
        return this.db.transaction(this.name, 'readwrite').objectStore(this.name).clear();
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
                    const txOS = upgradeDB.createObjectStore('tx', {keyPath: 'hash'});
                    txOS.createIndex('from', 'data.from', {unique: false});
                    txOS.createIndex('to', 'data.to', {unique: false});
                    upgradeDB.createObjectStore('accounts', {keyPath: 'id'});
                    upgradeDB.createObjectStore('settings', {keyPath: 'key'});
            }
        });
        this.transactions = new Index(this.db, 'tx', 'hash');
        this.accounts = new Index(this.db, 'accounts', 'id');
        this.settings = new Index(this.db, 'settings', 'key');
    }
}