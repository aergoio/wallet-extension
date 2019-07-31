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
  async createAccount ({ commit }, { network }) {
    const account = await promisifySimple(this._vm.$background.createAccount)({
      chainId: network
    });
    commit('addAccount', account);
    return account;
  },
  async importAccount ({ commit }, { identity, network }) {
    const account = await promisifySimple(this._vm.$background.importAccount)({
      privateKey: Array.from(identity.privateKey),
      chainId: network
    });
    commit('addAccount', account);
    return account;
  },
  async exportAccount ({}, { chainId, address, password }) {
    return await promisifySimple(this._vm.$background.exportAccount)({
      address,
      chainId,
      password
    });
  },
  async loadAccount ({}, { address, chainId }) {
    promisifySimple(this._vm.$background.setActiveAccount)({ address, chainId });
    return await promisifySimple(this._vm.$background.syncAccountState)({ address, chainId });
  },
  async getAccountTx ({ commit }, { address, chainId }) {
    const txs = await promisifySimple(this._vm.$background.getAccountTx)({ address, chainId });
    commit('setAccountTxs', { address, txs });
    return txs;
  },
  async addNetwork ({}, { chainId, nodeUrl }) {
    return await promisifySimple(this._vm.$background.addNetwork)({ chainId, nodeUrl });
  },
}

const mutations = {
    setAccounts (state, accounts) {
        state.addresses = accounts.map(acc => acc.key);
        for (let account of accounts) {
          state.accounts[account.key] = account;
        }
    },
    addAccount (state, account) {
        state.accounts[account.key] = account;
        state.addresses.push(account.key);
    },
    setAccount (state, account) {
        state.accounts[account.key] = account;
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