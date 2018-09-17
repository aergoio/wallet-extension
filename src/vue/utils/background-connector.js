export default class BackgroundConnector {
    static install (Vue, options) {
        Vue.prototype.$background = options.background;
        console.log('Configure Vue with $background', options.background);
    }
}