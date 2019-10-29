
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
import { promisifySimple } from '../utils/promisify';

const createRouter = (routes, store, gotoRoute) => {
    let initialLoad = true;
    const router = new VueRouter({
        routes
    });
    router.beforeEach((to, from, next) => {
        // Load persisted route on initial load
        // or whenever selecting account during permission request
        if (to.fullPath == '/' && initialLoad || to.name == 'deposit' && gotoRoute) {
            initialLoad = false;
            // Update address of request route
            if (gotoRoute && to.params && to.params.address) {
                gotoRoute.params.address = to.params.address;
            }
            const savedPath = gotoRoute || store.state.navigation.currentPath;
            if (savedPath && savedPath != to.fullPath) {
                next(savedPath);
                return;
            }
        }
        if (to.params.address) {
            try {
                const [chainId, address] = to.params.address.split('/');
                store.dispatch('navigation/setActiveAccount', { chainId, address });
            } catch (e) {
                console.error(e);
            }
        }
        if (!gotoRoute && to.fullPath != '/locked' && (!to.meta || to.meta.donottrack !== true)) {
            store.dispatch('navigation/setCurrentRoute', to);
        }
        next();
    });
    return router;
}

function getRequestId() {
    const urlParams = new URLSearchParams(window.location.search);
    const requestId = urlParams.get('request');
    return requestId;
}

async function handlePermissionRequest(background) {
    const activeAccount = await promisifySimple(background.getActiveAccount)();
    const requestId = getRequestId();
    let name = ''; // route name
    if (requestId) {
        console.log('have a request, getting data from background');
        const request = await promisifySimple(background.getPermissionRequestData)(requestId);
        console.log(request);
        store.dispatch('navigation/setActiveRequest', { requestId, request });
        const requestTypeToRoute = {
            'ACTIVE_ACCOUNT': 'account_public',
            'SIGN': 'sign',
            'SIGN_TX': 'tx_sign',
            'SEND_TX': 'tx_send',
        };
        name = requestTypeToRoute[request.type];
        if (!name) {
            console.log('invalid request type', request.type);
            return;
        };
    } else {
        store.dispatch('navigation/setActiveRequest', {});
        return null;
    }
    if (activeAccount) {
        return { name, params: { address: activeAccount.key } };
    } else {
        return { name, params: { address: 'none' } };
    }
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

    const gotoRoute = await handlePermissionRequest(opts.background);

    const router = createRouter(routes, store, gotoRoute);

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