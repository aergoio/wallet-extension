const state = {
  currentPath: '',
}

const getters = {
}

const actions = {
  setCurrentRoute ({ commit }, route) {
    commit('setCurrentPath', route.fullPath);
  },
}

const mutations = {
    setCurrentPath (state, path) {
        state.currentPath = path;
    },
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}