import React from "react";
import ReactDOM from "react-dom";
import "./index.scss";
import App from "./App";
import {Provider} from "react-redux";
import * as serviceWorker from "./serviceWorker";
import {store} from "./store";
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

export const bugsnagClient = bugsnag({
    apiKey: "f58d12ac7715ad9ffcfdd17fa3b93fc0",
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

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
