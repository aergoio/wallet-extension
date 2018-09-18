export default class BackgroundConnector {
    static install (Vue, options) {
        Vue.prototype.$background = options.background;
    }
}