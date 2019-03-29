import {applyMiddleware, combineReducers, createStore} from "redux";
import reducers from '../reducers/reducers';
import thunk from 'redux-thunk'

export const store = createStore(
    applyMiddleware(thunk) as any,
    combineReducers({
        state: reducers,
    }),

    (window as any).__REDUX_DEVTOOLS_EXTENSION__ && (window as any).__REDUX_DEVTOOLS_EXTENSION__()
);