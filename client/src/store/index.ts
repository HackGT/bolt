import {applyMiddleware, combineReducers, compose, createStore} from "redux";
import reducers from '../reducers/reducers';
import thunk from 'redux-thunk'

export const store = createStore(
    reducers,
    compose(
        applyMiddleware(thunk) as any,
        (window as any).__REDUX_DEVTOOLS_EXTENSION__ && (window as any).__REDUX_DEVTOOLS_EXTENSION__()
    )
);