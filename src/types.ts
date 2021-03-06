export type State = Record<string, any>;

export type MutationFunction<T> = (stateCopy: State, payload?: any) => void;

export type ActionHandler<T> = (stateCopy: State, payload?: any) => State;

export type Reducer = (state: State, action: ActionGeneratorResult) => State;

export interface ActionGeneratorResult {
    type: string;
    payload: any;
}

export type Action = (payload: any) => ActionGeneratorResult;

export interface StoreDescriptor {
    state: any;
    mutations?: Record<string, MutationFunction<any>>;
    getters?: Record<string, any>;
    modules?: Record<string, StoreDescriptor>;
}

export interface ReaxStore {
    reduxStore: any;
    commit: (mutationKey: string, payload: any) => void;
    getters: Record<string, any>;
    state?: any;
    registerModule?: (moduleKey: string, module: StoreDescriptor) => void;
    unregisterModule?: (moduleKet: string) => void;
}
