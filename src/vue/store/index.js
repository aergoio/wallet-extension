import Vuex from 'vuex';
import Vue from 'vue';
import VuexPersist from 'vuex-persist';
import accounts from './accounts';
import navigation from './navigation';

const debug = process.env.NODE_ENV !== 'production';

Vue.use(Vuex);

const vuexLocalStorage = new VuexPersist({
  key: 'vuex',
  storage: window.localStorage,
});

export default new Vuex.Store({
  modules: {
    accounts,
    navigation,
  },
  strict: debug,
  plugins: [vuexLocalStorage.plugin]
})