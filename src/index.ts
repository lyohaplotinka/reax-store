import { combineReducers, createStore } from 'redux';
import { useSelector } from 'react-redux';
import { Action, ActionGeneratorResult, ActionHandler, ReaxStore, Reducer, StoreDescriptor } from './types';

function createStoreModule(storeDescriptor: StoreDescriptor, moduleName = 'root') {
    const actions: Record<string, Action> = {};
    const handlers: Record<string, ActionHandler<any>> = {};
    const getters: Record<string, () => any> = {};
    const modulePrefix = moduleName === 'root' ? '' : moduleName + '/';

    Object.entries(storeDescriptor.mutations).forEach(([mutationKey, mutationFunction]) => {
        const actionType = 'A_' + mutationKey.toUpperCase();
        actions[modulePrefix + mutationKey] = (payload: any) => ({ type: actionType, payload });
        handlers[actionType] = (state: any, payload: any = null) => {
            const stateCopy = { ...state };
            mutationFunction(stateCopy, payload);
            return stateCopy;
        };
    });
    Object.entries(storeDescriptor.getters).forEach(([getterKey, getterFunction]) => {
        getters[modulePrefix + getterKey] = () => useSelector((store: any) => getterFunction(store[moduleName]));
    });

    return {
        moduleReducer: (state = storeDescriptor.state, action: ActionGeneratorResult) =>
            handlers[action.type] ? handlers[action.type](state, action.payload) : state,
        moduleGetters: getters,
        moduleActions: actions,
    };
}

export function createReaxStore(storeDescriptor: StoreDescriptor): ReaxStore {
    const reducersObject: Record<string, Reducer> = {};
    const initialStateObject: Record<string, any> = {};
    let getters: Record<string, (args?: any[]) => any> = {};
    let actions: Record<string, Action> = {};
    const parseModule = (module: StoreDescriptor, moduleName = 'root') => {
        const { moduleReducer, moduleGetters, moduleActions } = createStoreModule(module, moduleName);
        initialStateObject[moduleName] = module.state;
        reducersObject[moduleName] = moduleReducer;
        getters = { ...getters, ...moduleGetters };
        actions = { ...actions, ...moduleActions };
    };
    parseModule(storeDescriptor);
    storeDescriptor.modules &&
        Object.entries(storeDescriptor.modules).forEach(([moduleName, storeDescriptor]) =>
            parseModule(storeDescriptor, moduleName),
        );
    const reducers = combineReducers(reducersObject);
    const reduxStore = createStore(reducers, initialStateObject);
    const reaxStore: ReaxStore = {
        reduxStore,
        commit: (action: string, payload = null) => reduxStore.dispatch(actions[action](payload)),
        getters,
        registerModule: (moduleKey: string, module: StoreDescriptor) => {
            parseModule(module, moduleKey);
            reduxStore.replaceReducer(combineReducers(reducersObject));
            reaxStore.getters = getters;
        },
        unregisterModule: (moduleKey: string) => {
            delete reducersObject[moduleKey];
            reduxStore.replaceReducer(combineReducers(reducersObject));
            Object.keys(reaxStore.getters).forEach((key) => key.includes(moduleKey) && delete reaxStore.getters[key]);
        },
    };
    Object.defineProperty(reaxStore, 'state', {
        get(): any {
            const { root, ...rest }: Record<string, any> = reduxStore.getState();
            return { ...root, ...rest };
        },
        enumerable: true,
    });
    return reaxStore;
}
