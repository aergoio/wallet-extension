const state = {
    currentPath: '',
    previousPath: '',
    activeAccount: {}
};

const getters = {
};

const actions = {
    setCurrentRoute ({ commit }, route) {
        commit('setCurrentPath', route.fullPath);
    },
    setActiveAccount ({ commit }, address) {
        commit('setActiveAccount', address);
    },
};

const mutations = {
    setCurrentPath (state, path) {
        state.previousPath = state.currentPath;
        state.currentPath = path;
    },
    setActiveAccount (state, address) {
        if (address === state.activeAccount) return;
        state.activeAccount = address;
    },
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}