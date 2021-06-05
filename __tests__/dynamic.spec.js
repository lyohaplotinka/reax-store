import { createReaxStore } from '../dist';

const ThirdModule = {
    state: {
        checkbox: false,
    },
    mutations: {
        changeState(state, payload) {
            state.checkbox = payload;
        },
    },
    getters: {
        getState: (state) => state.checkbox,
    },
};

const testStore = {
    state: {
        count: 3,
    },
    mutations: {
        setCount(state, payload) {
            state.count = payload;
        },
    },
    getters: {
        getCount: (state) => state.count,
    },
};

describe('Reax store with dynamic module', () => {
    let store;

    it('Creates store instance', () => {
        expect(() => {
            store = createReaxStore(testStore);
        }).not.toThrowError();
    });

    it('Registers module without error', () => {
        expect(() => {
            store.registerModule('ThirdModule', ThirdModule);
        }).not.toThrowError();
    });

    it('Has direct non-reactive state dynamic module access', () => {
        expect(store.state.ThirdModule.checkbox).toBeDefined();
    });

    it('Sets initial dynamic module state correctly', () => {
        expect(store.state.ThirdModule.checkbox).toEqual(false);
    });

    it('Correctly mutates dynamic module state', () => {
        const newState = true;
        store.commit('ThirdModule/changeState', newState);
        expect(store.state.ThirdModule.checkbox).toEqual(newState);
    });

    it('Has all required module getters', () => {
        Object.keys(ThirdModule.getters).forEach((key) => {
            expect(store.getters['ThirdModule/' + key]).toBeInstanceOf(Function);
        });
    });

    it('Has no module state after it has been unregistered', () => {
        store.unregisterModule('ThirdModule');
        expect(store.state.ThirdModule).toBeUndefined();
    });

    it('Has no module getters after it has been unregistered', () => {
        Object.keys(ThirdModule.getters).forEach((key) => {
            expect(store.getters['ThirdModule/' + key]).toBeUndefined();
        });
    });
});
