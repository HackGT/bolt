import {applyMiddleware, combineReducers, compose, createStore} from "redux";
import reducers from "../reducers/reducers";
import thunk from "redux-thunk";
import {User} from "../types/User";
import account from "./Account";
import desk from "./Desk";

const reducer = combineReducers({
    reducers,
    account,
    desk
});

// thanks https://github.com/reduxjs/redux/issues/2359#issuecomment-372609400
const composeSetup =
    process.env.NODE_ENV !== "production" && typeof window === "object" &&
    (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
        (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ : compose;

export const store = createStore(
    reducer,
    composeSetup(
        applyMiddleware(thunk) as any
    )
);

export interface AppState {
    account: User;
}
