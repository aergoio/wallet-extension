import { promisifySimple } from '../../utils/promisify';

const state = {
  accounts: [],
}

const getters = {

}

const actions = {
  async getAccounts ({ commit }) {
    const accounts = await promisifySimple(this._vm.$background.getAccounts)();
    commit('setAccounts', accounts);
  },
  async createAccount ({ commit }, options) {
    const account = await promisifySimple(this._vm.$background.createAccount)(options);
    commit('addAccount', account);
    return account;
  },
}

const mutations = {
    setAccounts (state, accounts) {
        state.accounts = accounts;
    },
    addAccount (state, account) {
        state.accounts.push(account);
    }
    /*
  pushProductToCart (state, { id }) {
    state.items.push({
      id,
      quantity: 1
    })
  },*/
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}