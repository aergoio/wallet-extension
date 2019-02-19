import Store from '../../controllers/store';

export default class IndexedDb {
    static install (Vue) {
        Vue.prototype.$db = new Store();
    }
}