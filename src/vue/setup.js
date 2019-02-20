
import Vue from 'vue';
import Popup from './Popup';
import VueRouter from 'vue-router';
import routes from './routes';
import Button from './components/Button';
import store from './store/index';
import { shortAddress } from './filters/address';
import { formatToken } from './filters/format-token';
import { formatNumber } from './filters/format-number';
import BackgroundConnector from './utils/background-connector';
import IndexedDb from './utils/indexed-db';
import { tooltip } from './directives/tooltip';


const createRouter = (routes, store) => {
    let initialLoad = true;
    const router = new VueRouter({
        routes
    });
    router.beforeEach((to, from, next) => {
        // Load persisted route on initial load
        if (to.fullPath == '/' && initialLoad) {
            initialLoad = false;
            const savedPath = store.state.navigation.currentPath;
            if (savedPath && savedPath != to.fullPath) {
                next(savedPath);
                return;
            }
        }
        if (to.fullPath != '/locked') {
            store.dispatch('navigation/setCurrentRoute', to);
        }
        next();
    });
    return router;
}

export default async function setup(opts) {
    Vue.use(VueRouter);
    Vue.use(BackgroundConnector, {background: opts.background});
    Vue.use(IndexedDb);

    Vue.component('Button', Button);
    Vue.filter('shortAddress', shortAddress);
    Vue.filter('formatToken', formatToken);
    Vue.filter('formatNumber', formatNumber);
    Vue.directive('tooltip', tooltip);

    const router = createRouter(routes, store);

    const vue = new Vue({
        el: "#app",
        render: createElement => createElement(Popup),
        router,
        store,
    });

    vue.$background.on('update', function(state) {
        console.log('there is an update from the background');
        console.log(state);
        //store.commit('')
        if (state.hasOwnProperty('unlocked') && !state.unlocked) {
            router.push('/locked');
        }
    });

    Vue.config.devtools = true;
}