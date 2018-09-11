import "regenerator-runtime/runtime";

require('./assets/style/popup.scss');

import Vue from 'vue';
import Popup from './vue/Popup';
import VueRouter from 'vue-router';
import routes from './config/routes';

Vue.use(VueRouter);

const router = new VueRouter({
    routes
})

new Vue({
    el: "#app",
    render: createElement => createElement(Popup),
    router
})