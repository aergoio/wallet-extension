const state = {
    currentPath: '',
    previousPath: '',
};

const getters = {
};

const actions = {
    setCurrentRoute ({ commit }, route) {
        commit('setCurrentPath', route.fullPath);
    },
};

const mutations = {
    setCurrentPath (state, path) {
        state.previousPath = state.currentPath;
        state.currentPath = path;
    },
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}