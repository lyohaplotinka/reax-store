import { Action, ActionGeneratorResult, ActionHandler, ReaxStore, Reducer, StoreDescriptor } from './types';
import { useSelector } from 'react-redux';
import { combineReducers, createStore } from 'redux';

function parseModule(name = 'root', desc: StoreDescriptor) {
    const handlers: Record<string, ActionHandler<any>> = {};
    const mPrefix = name === 'root' ? '' : name + '/';
    return {
        mActions: Object.entries(desc.mutations ?? {}).reduce((total: Record<string, any>, [key, func]) => {
            const type = 'A_' + key.toUpperCase();
            handlers[type] = (state: any, payload: any = null) => {
                const s = { ...state };
                func(s, payload);
                return s;
            };
            total[mPrefix + key] = (payload: any) => ({ type, payload });
            return total;
        }, {}),
        mGetters: Object.entries(desc.getters ?? {}).reduce((total: Record<string, any>, [key, func]) => {
            total[mPrefix + key] = () => useSelector((store: any) => func(store[name]));
            return total;
        }, {}),
        mReducer: (state = desc.state, action: ActionGeneratorResult) =>
            handlers[action.type] ? handlers[action.type](state, action.payload) : state,
    };
}

export function createReaxStore(storeDescriptor: StoreDescriptor): ReaxStore {
    const allReducers: Record<string, Reducer> = {};
    const allInitial: Record<string, any> = {};
    let getters: Record<string, (args?: any[]) => any> = {};
    let actions: Record<string, Action> = {};
    const createModule = (name = 'root', module: StoreDescriptor) => {
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
    const reaxStore: ReaxStore = {
        reduxStore,
        commit: (action: string, payload = null) => reduxStore.dispatch(actions[action](payload)),
        getters,
        registerModule: (moduleKey: string, module: StoreDescriptor) => {
            createModule(moduleKey, module);
            reduxStore.replaceReducer(combineReducers(allReducers));
            reaxStore.getters = getters;
        },
        unregisterModule: (moduleKey: string) => {
            delete allReducers[moduleKey];
            reduxStore.replaceReducer(combineReducers(allReducers));
            Object.keys(reaxStore.getters).forEach((key) => key.includes(moduleKey) && delete reaxStore.getters[key]);
        },
        get state() {
            const { root, ...rest }: Record<string, any> = reduxStore.getState();
            return { ...root, ...rest };
        },
    };
    return reaxStore;
}
