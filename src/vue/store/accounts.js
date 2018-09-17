import { promisifySimple } from '../../utils/promisify';

const state = {
  accounts: [],
}

const getters = {

}

const actions = {
  async getAccounts ({ commit }) {
    const accounts = await promisifySimple(this._vm.$background.getAccounts)();
    console.log(accounts);
    commit('setAccounts', accounts);
  },
}

const mutations = {
    setAccounts (state, accounts) {
        state.accounts = accounts;
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