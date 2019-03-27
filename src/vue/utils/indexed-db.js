import store from '../../controllers/store';

export default class IndexedDb {
    static install (Vue) {
        Vue.prototype.$db = store;
    }
}