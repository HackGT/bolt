import React from "react";
import ReactDOM from "react-dom";
import "./index.scss";
import App from "./App";
import {Provider} from "react-redux";
import * as serviceWorker from "./serviceWorker";
import {store} from "./state/Store";
import {ApolloClient} from "apollo-client";
import {split} from "apollo-link";
import {createHttpLink} from "apollo-link-http";
import {InMemoryCache} from "apollo-cache-inmemory";
import bugsnag from "@bugsnag/js";
import bugsnagReact from "@bugsnag/plugin-react";
import packageJson from "../package.json";
import {WebSocketLink} from "apollo-link-ws";
import {SubscriptionClient} from "subscriptions-transport-ws";
import {getMainDefinition} from "apollo-utilities";
import {ApolloProvider} from "@apollo/react-common";

const httpLink = createHttpLink({
    uri: "/api",
    credentials: "include"
});

const wsProtocol = location.protocol === "http:" ? "ws" : "wss";
// FIXME: URL needs to be dynamic
const wsClient = new SubscriptionClient(`${wsProtocol}://localhost:3000/api`, {
    reconnect: true
});
const wsLink = new WebSocketLink(wsClient);
const link = split(
    // split based on operation type
    ({query}) => {
        const definition = getMainDefinition(query);
        return (
            definition.kind === "OperationDefinition" &&
            definition.operation === "subscription"
        );
    },
    wsLink,
    httpLink
);

// old error handling code
// : ApolloLink.from([
//     onError(({graphQLErrors, networkError}) => {
//         if (graphQLErrors) {
//             graphQLErrors.map(({message, locations, path}) =>
//                 console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`)
//             );
//         }
//         if (networkError) {
//             console.log(`[Network error]: ${networkError}`);
//         }
//     }),
//     new HttpLink({
//         uri: "/api",
//         credentials: "include"
//     })
// ]),

// @ts-ignore
export const client = new ApolloClient({
    link,
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
