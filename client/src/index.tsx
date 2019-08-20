import React from "react";
import ReactDOM from "react-dom";
import "./index.scss";
import App from "./App";
import {Provider} from "react-redux";
import * as serviceWorker from "./serviceWorker";
import {store} from "./state/Store";
import ApolloProvider from "react-apollo/ApolloProvider";
import {ApolloClient} from "apollo-client";
import {ApolloLink} from "apollo-link";
import {onError} from "apollo-link-error";
import {HttpLink} from "apollo-link-http";
import {InMemoryCache} from "apollo-cache-inmemory";
import bugsnag from "@bugsnag/js";
import bugsnagReact from "@bugsnag/plugin-react";
import packageJson from "../package.json";

// @ts-ignore
const client = new ApolloClient({
    link: ApolloLink.from([
        onError(({graphQLErrors, networkError}) => {
            if (graphQLErrors) {
                graphQLErrors.map(({message, locations, path}) =>
                    console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`)
                );
            }
            if (networkError) {
                console.log(`[Network error]: ${networkError}`);
            }
        }),
        new HttpLink({
            uri: "/api",
            credentials: "include"
        })
    ]),
    cache: new InMemoryCache(),
    defaultOptions: {
        query: {
            errorPolicy: "all"
        }
    }
});
export const bugsnagEnabled = process.env.REACT_APP_ENABLE_BUGSNAG!.toLowerCase() === "true";
export let bugsnagClient: any;
if (bugsnagEnabled) {
    bugsnagClient = bugsnag({
        apiKey: process.env.REACT_APP_BUGSNAG_API_KEY as string,
        appVersion: `${packageJson.version}`
    });
    bugsnagClient.use(bugsnagReact, React);
    const ErrorBoundary = bugsnagClient.getPlugin("react");
    ReactDOM.render(
        (<ErrorBoundary>
            <ApolloProvider client={client}>
                <Provider store={store}>
                    <App/>
                </Provider>
            </ApolloProvider>
        </ErrorBoundary>), document.getElementById("root"));
} else {
    ReactDOM.render(
        (<ApolloProvider client={client}>
            <Provider store={store}>
                <App/>
            </Provider>
        </ApolloProvider>), document.getElementById("root"));
}


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
