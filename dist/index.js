import { combineReducers, createStore } from 'redux';
import { useSelector } from 'react-redux';

const createAction = (type, func) => ({
    action: (payload) => ({ type, payload }),
    actionHandler: (state, payload = null) => {
        const stateCopy = { ...state };
        func(stateCopy, payload);
        return stateCopy;
    },
});
const createReducer = (storeDescriptor, handlers) => (state = storeDescriptor.state, action) => handlers[action.type]
    ? handlers[action.type](state, action.payload)
    : state;
function createStoreModule(storeDescriptor, moduleName = 'root') {
    const actions = {};
    const handlers = {};
    const getters = {};
    const modulePrefix = moduleName === 'root' ? '' : moduleName + '/';
    Object.entries(storeDescriptor.mutations).forEach(([mutationKey, mutationFunction]) => {
        const actionType = 'A_' + mutationKey.toUpperCase();
        const { action, actionHandler } = createAction(actionType, mutationFunction);
        actions[modulePrefix + mutationKey] = action;
        handlers[actionType] = actionHandler;
    });
    Object.entries(storeDescriptor.getters).forEach(([getterKey, getterFunction]) => {
        getters[modulePrefix + getterKey] = () => useSelector((store) => getterFunction(store[moduleName]));
    });
    return {
        moduleReducer: createReducer(storeDescriptor, handlers),
        moduleGetters: getters,
        moduleActions: actions,
    };
}
function createReaxStore(storeDescriptor) {
    const reducersObject = {};
    const initialStateObject = {};
    let getters = {};
    let actions = {};
    const parseModule = (module, moduleName = 'root') => {
        const { moduleReducer, moduleGetters, moduleActions } = createStoreModule(module, moduleName);
        initialStateObject[moduleName] = module.state;
        reducersObject[moduleName] = moduleReducer;
        getters = { ...getters, ...moduleGetters };
        actions = { ...actions, ...moduleActions };
    };
    parseModule(storeDescriptor);
    storeDescriptor.modules &&
        Object.entries(storeDescriptor.modules).forEach(([moduleName, storeDescriptor]) => parseModule(storeDescriptor, moduleName));
    const reducers = combineReducers(reducersObject);
    const reduxStore = createStore(reducers, initialStateObject);
    const reaxStore = {
        reduxStore,
        commit: (action, payload = null) => reduxStore.dispatch(actions[action](payload)),
        getters,
        registerModule: (moduleKey, module) => {
            parseModule(module, moduleKey);
            reduxStore.replaceReducer(combineReducers(reducersObject));
            reaxStore.getters = { ...reaxStore.getters, ...getters };
        },
        unregisterModule: (moduleKey) => {
            delete reducersObject[moduleKey];
            reduxStore.replaceReducer(combineReducers(reducersObject));
            for (const key in reaxStore.getters) {
                if (Object.prototype.hasOwnProperty.call(reaxStore.getters, key) &&
                    key.includes(moduleKey))
                    delete reaxStore.getters[key];
            }
        },
    };
    Object.defineProperty(reaxStore, 'state', {
        get() {
            const { root, ...rest } = reduxStore.getState();
            return { ...root, ...rest };
        },
        enumerable: true,
    });
    return reaxStore;
}

export { createReaxStore };
