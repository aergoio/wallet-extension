
import Vue from 'vue';
import Popup from './Popup';
import VueRouter from 'vue-router';
import routes from '../config/routes';
import Button from './components/Button';
import store from './store/index';
import { shortAddress } from './filters/address';
import BackgroundConnector from './utils/background-connector';

export default async function setup(opts) {
    Vue.use(VueRouter);
    Vue.use(BackgroundConnector, {background: opts.background});

    const router = new VueRouter({
        routes
    });

    Vue.component('Button', Button);
    Vue.filter('shortAddress', shortAddress);

    const vue = new Vue({
        el: "#app",
        render: createElement => createElement(Popup),
        router,
        store
    });

    vue.$background.on('update', function(foo) {
        console.log('there is an update from the background');
        console.log(foo);
    });
}