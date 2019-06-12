import {applyMiddleware, compose, createStore} from "redux";
import reducers from "../reducers/reducers";
import thunk from "redux-thunk";

// thanks https://github.com/reduxjs/redux/issues/2359#issuecomment-372609400
const composeSetup =
    process.env.NODE_ENV !== "production" && typeof window === "object" &&
    (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
        (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ : compose;

export const store = createStore(
    reducers,
    composeSetup(
        applyMiddleware(thunk) as any

    )
);
