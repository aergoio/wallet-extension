import Vuex from 'vuex';
import Vue from 'vue';
import accounts from './accounts';

const debug = process.env.NODE_ENV !== 'production';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    accounts,
  },
  strict: debug
})