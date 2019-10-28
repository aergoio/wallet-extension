const state = {
    currentPath: '',
    previousPath: '',
    activeAccount: {},
    activeRequest: null,
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
    setActiveRequest ({ commit }, { requestId, request }) {
        commit('setActiveRequest', { requestId, request });
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
    setActiveRequest (state, request) {
        state.activeRequest = request;
    },
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}