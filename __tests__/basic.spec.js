import { createReaxStore } from '../dist';

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

const testStoreNoGetters = {
    state: {
        count: 3,
    },
    mutations: {
        setCount(state, payload) {
            state.count = payload;
        },
    },
};

const testStoreNoState = {
    mutations: {
        setCount(state, payload) {
            state.count = payload;
        },
    },
    getters: {
        getCount: (state) => state.count,
    },
};

const testStoreNoMutations = {
    state: {
        count: 3,
    },
    getters: {
        getCount: (state) => state.count,
    },
};

describe('Basic Reax store', () => {
    let store;

    it('Exports function', () => {
        expect(createReaxStore).toBeInstanceOf(Function);
    });

    it('Does not fail if no getters defined', () => {
        expect(() => {
            let storeNoGetters = createReaxStore(testStoreNoGetters);
        }).not.toThrowError();
    });

    it('Does not fail if no mutations defined', () => {
        expect(() => {
            let storeNoMutations = createReaxStore(testStoreNoMutations);
        }).not.toThrowError();
    });

    it('Fails if no "state" key in descriptor', () => {
        expect(() => {
            let storeNoState = createReaxStore(testStoreNoState);
        }).toThrowError();
    });

    it('Creates store instance', () => {
        expect(() => {
            store = createReaxStore(testStore);
        }).not.toThrowError();
    });

    it('Has direct non-reactive state access', () => {
        expect(store.state.count).toBeDefined();
    });

    it('Sets initial state correctly', () => {
        expect(store.state.count).toEqual(3);
    });

    it('Correctly mutates state', () => {
        const newCount = 22;
        store.commit('setCount', newCount);
        expect(store.state.count).toEqual(newCount);
    });

    it('Has all required getters', () => {
        Object.keys(testStore.getters).forEach((key) => {
            expect(store.getters[key]).toBeInstanceOf(Function);
        });
    });
});
