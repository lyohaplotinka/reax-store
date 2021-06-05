import { useSelector } from 'react-redux';
import { createStore, combineReducers } from 'redux';

function parseModule(name = 'root', desc) {
    const handlers = {};
    const mPrefix = name === 'root' ? '' : name + '/';
    return {
        mActions: Object.entries(desc.mutations ?? {}).reduce((total, [key, func]) => {
            const type = 'A_' + key.toUpperCase();
            handlers[type] = (state, payload = null) => {
                const s = { ...state };
                func(s, payload);
                return s;
            };
            total[mPrefix + key] = (payload) => ({ type, payload });
            return total;
        }, {}),
        mGetters: Object.entries(desc.getters ?? {}).reduce((total, [key, func]) => {
            total[mPrefix + key] = () => useSelector((store) => func(store[name]));
            return total;
        }, {}),
        mReducer: (state = desc.state, action) => handlers[action.type] ? handlers[action.type](state, action.payload) : state,
    };
}
function createReaxStore(storeDescriptor) {
    const allReducers = {};
    const allInitial = {};
    let getters = {};
    let actions = {};
    const createModule = (name = 'root', module) => {
        if (!Object.prototype.hasOwnProperty.call(module, 'state'))
            throw new ReferenceError('[reax] cannot create store without state');
        const { mReducer, mGetters, mActions } = parseModule(name, module);
        allInitial[name] = module.state;
        allReducers[name] = mReducer;
        getters = { ...getters, ...mGetters };
        actions = { ...actions, ...mActions };
    };
    createModule('root', storeDescriptor);
    Object.entries(storeDescriptor.modules ?? {}).forEach((e) => createModule(...e));
    const reduxStore = createStore(combineReducers(allReducers));
    const reaxStore = {
        reduxStore,
        commit: (action, payload = null) => reduxStore.dispatch(actions[action](payload)),
        getters,
        registerModule: (moduleKey, module) => {
            createModule(moduleKey, module);
            reduxStore.replaceReducer(combineReducers(allReducers));
            reaxStore.getters = getters;
        },
        unregisterModule: (moduleKey) => {
            delete allReducers[moduleKey];
            reduxStore.replaceReducer(combineReducers(allReducers));
            Object.keys(reaxStore.getters).forEach((key) => key.includes(moduleKey) && delete reaxStore.getters[key]);
        },
        get state() {
            const { root, ...rest } = reduxStore.getState();
            return { ...root, ...rest };
        },
    };
    return reaxStore;
}

export { createReaxStore };
