
import Vue from 'vue';
import Popup from './Popup';
import VueRouter from 'vue-router';
import routes from '../config/routes';
import Button from './components/Button';
import store from './store/index';
import { shortAddress } from './filters/address';
import BackgroundConnector from './utils/background-connector';
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
        store.dispatch('navigation/setCurrentRoute', to);
        next();
    });
    return router;
}

export default async function setup(opts) {
    Vue.use(VueRouter);
    Vue.use(BackgroundConnector, {background: opts.background});

    Vue.component('Button', Button);
    Vue.filter('shortAddress', shortAddress);
    Vue.directive('tooltip', tooltip);

    const vue = new Vue({
        el: "#app",
        render: createElement => createElement(Popup),
        router: createRouter(routes, store),
        store
    });

    vue.$background.on('update', function(state) {
        console.log('there is an update from the background');
        console.log(state);
    });

    Vue.config.devtools = true;
}