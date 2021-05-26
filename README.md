# Reax-store
### React state management with Redux, but similar to Vuex 

I really love Vuex and find it the most convenient library for 
managing application state. This repository is a lightweight 
add-on over react-redux that allows you to create and interact 
with a store like you do in Vue + Vuex. 

### Important points
* It is **not 100% Vuex compatible**. Please do not open issues 
  related to API mismatch, or the fact that some things are not 
  quite in the places where you expect.
* In this implementation there are no "actions", since I believe 
  that they should not be in the store :) 
* This library is primarily aimed at components in a functional 
  style, there are no special solutions for class components. 
  
### Getting started 
Reax-store does not include redux and react-redux, so first 
you need to install three packages: 
```bash
npm install redux react-redux reax-store
```
Then, create a file describing your store:
```javascript
// src/store/index.js

import { createReaxStore } from "reax-store";

export default createReaxStore({
  state: {
      count: 0
  },
  mutations: {
      incrementCount(state, payload) {
          state.count += payload ?? 1
      }
  },
  getters: {
      getCount: state => state.count
  }
})
```

Use `react-redux` provider to connect Redux store to your app
like this:

```javascript
// main.jsx
// ...
import store from "./store";
import { Provider } from "react-redux";

ReactDOM.render(
        <Provider store={store.reduxStore}>
            <App/>
        </Provider>,
        document.getElementById('root')
)
```

After that you can use Reax in your components like this:
```javascript
// App.jsx
import store from "./store";

function App() {
  // Please note: unlike Vuex, we must call 
  // the getter function, since in Reax this 
  // is just a wrapper over the react-redux 
  // useSelector hook. 
  const count = store.getters.getCount()
  
  return (
      <div>
        <p>{count}</p>
        <button onClick={() => {
          store.commit('incrementCount', 3)
        }}>
          count is: {count}
        </button>
      </div>
  )
}
```

That's it! 

### Modules

As with Vuex, you can use modules. All modules are always 
namespaced. Accessing getters and mutations is similar 
to Vuex. 
```javascript
// src/store/index.js

import { createReaxStore } from "reax-store";

const LetterModule = {
  state: {
      text: 'a'
  },
  mutations: {
      addA(state) {
          state.text += 'a'
      }
  },
  getters: {
      getText: state => state.text
  }
}

export default createReaxStore({
  state: {
      count: 0
  },
  mutations: {
      incrementCount(state, payload) {
          state.count += payload ?? 1
      }
  },
  getters: {
      getCount: state => state.count
  },
  modules: {
      LetterModule
  }
})
```
```javascript
// App.jsx
import store from "./store";

function App() {
  const count = store.getters.getCount()
  const letters = store.getters['LetterModule/getText']()
  
  return (
      <div>
        <p>{count}</p>
        <p>{text}</p>
        <button onClick={() => {
          store.commit('incrementCount', 3)
          store.commit('LetterModule/addA')
        }}>
          count is: {count}
        </button>
      </div>
  )
}
```

You can register and unregister modules dynamically using 
the `registerModule` and `unregisterModule` methods of the 
store instance. 

```javascript
// src/store/index.js

import { createReaxStore } from "reax-store";

export const LetterModule = {
  state: {
      text: 'a'
  },
  mutations: {
      addA(state) {
          state.text += 'a'
      }
  },
  getters: {
      getText: state => state.text
  }
}

export default createReaxStore({
  state: {
      count: 0
  },
  mutations: {
      incrementCount(state, payload) {
          state.count += payload ?? 1
      }
  },
  getters: {
      getCount: state => state.count
  }
})
```
```javascript
// App.jsx
import store, { LetterModule } from "./store";

store.registerModule('LetterModule', LetterModule)

function App() {
  useEffect(() => {
      return () => store.unregisterModule('LetterModule')
  }, [])
    
  const count = store.getters.getCount()
  const letters = store.getters['LetterModule/getText']()
  
  return (
      <div>
        <p>{count}</p>
        <p>{text}</p>
        <button onClick={() => {
          store.commit('incrementCount', 3)
          store.commit('LetterModule/addA')
        }}>
          count is: {count}
        </button>
      </div>
  )
}
```

### Accessing the native Redux store 

The Redux store is always available in the Reax store 
using the `reduxStore` key. 

### TODO
* [ ] Accessing Global Assets in modules 
  (`getters`, `rootState`, `rootGetters`) for getter 
  functions
