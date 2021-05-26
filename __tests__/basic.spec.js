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

describe('Basic Reax store', () => {
    let store;

    it('Exports function', () => {
        expect(createReaxStore).toBeInstanceOf(Function);
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
