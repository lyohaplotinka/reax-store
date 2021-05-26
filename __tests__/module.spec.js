import { createReaxStore } from '../dist';

const SecondModule = {
    state: {
        text: 'Hello',
    },
    mutations: {
        setText(state, payload) {
            state.text = payload;
        },
    },
    getters: {
        getText: (state) => state.text,
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
    modules: {
        SecondModule,
    },
};

describe('Moduled Reax store', () => {
    let store;

    it('Creates store instance', () => {
        expect(() => {
            store = createReaxStore(testStore);
        }).not.toThrowError();
    });

    it('Has direct non-reactive state module access', () => {
        expect(store.state.SecondModule.text).toBeDefined();
    });

    it('Sets initial module state correctly', () => {
        expect(store.state.SecondModule.text).toEqual('Hello');
    });

    it('Correctly mutates module state', () => {
        const newText = 'World';
        store.commit('SecondModule/setText', newText);
        expect(store.state.SecondModule.text).toEqual(newText);
    });

    it('Has all required module getters', () => {
        Object.keys(SecondModule.getters).forEach((key) => {
            expect(store.getters['SecondModule/' + key]).toBeInstanceOf(
                Function,
            );
        });
    });
});
