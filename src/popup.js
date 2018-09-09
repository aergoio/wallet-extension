require('./assets/style/popup.scss');

import Vue from 'vue';
import Popup from './components/Popup'

new Vue({
    el: "#app",
    render: createElement => createElement(Popup)
})