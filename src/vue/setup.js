
import Vue from 'vue';
import Popup from './Popup';
import VueRouter from 'vue-router';
import routes from '../config/routes';
import Button from './components/Button';

export default async function setup(opts) {
    Vue.use(VueRouter);

    const router = new VueRouter({
        routes
    });

    Vue.component('Button', Button);

    new Vue({
        el: "#app",
        render: createElement => createElement(Popup),
        router
    });

    console.log('Configure Vue with opts', opts);

    opts.background.on('update', function(foo) {
        console.log('there is an update from the background');
        console.log(foo);
    });
}