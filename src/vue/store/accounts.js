import { promisifySimple } from '../../utils/promisify';

const state = {
  addresses: [],
  accounts: {},
  txs: {},
}

const getters = {

}

const actions = {
  async getAccounts ({ commit }) {
    const accounts = await promisifySimple(this._vm.$background.getAccounts)();
    console.log('got accounts', accounts);
    commit('setAccounts', accounts);
    return accounts;
  },
  async createAccount ({ commit }, options) {
    const account = await promisifySimple(this._vm.$background.createAccount)(options);
    commit('addAccount', account);
    return account;
  },
  async importAccount ({ commit }, { identity }) {
    const account = await promisifySimple(this._vm.$background.importAccount)({
      privateKey: identity.privateKey.toArray()
    });
    commit('addAccount', account);
    return account;
  },
  async loadAccount ({ commit }, { address }) {
    const account = await promisifySimple(this._vm.$background.syncAccountState)(address);
    commit('setAccount', { account });
    return account;
  },
  async getAccountTx ({ commit }, { address }) {
    const txs = await promisifySimple(this._vm.$background.syncAccountTx)(address);
    commit('setAccountTxs', { address, txs });
    return txs;
  },
}

const mutations = {
    setAccounts (state, accounts) {
        state.addresses = accounts.map(acc => acc.id);
        for (let account of accounts) {
          state.accounts[account.id] = account;
        }
    },
    addAccount (state, account) {
        state.accounts[account.id] = account;
        state.addresses.push(account.id);
    },
    setAccount (state, account) {
      state.accounts[account.id] = account;
    },
    setAccountTxs (state, { address, txs }) {
      state.txs[address] = txs;
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}