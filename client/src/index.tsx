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
import {defaultDataIdFromObject, InMemoryCache} from "apollo-cache-inmemory";
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

// @ts-ignore
global.appVersion = packageJson.version;

const wsProtocol = window.location.protocol === "http:" ? "ws" : "wss";
const wsHost = (!process.env.NODE_ENV || process.env.NODE_ENV === "development") ? "localhost:3000" : window.location.host;
const wsUrl = `${wsProtocol}://${wsHost}/api`;
const wsClient = new SubscriptionClient(wsUrl, {
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

export const client = new ApolloClient({
    link,
    cache: new InMemoryCache({
        dataIdFromObject: (object: any) => {
            console.log("*** apollo cache for object", object.__typename);
            switch (object.__typename) {
                case 'Location':
                    console.log("location", object);
                    return "Location:" + object.location_id;
                case 'Category':
                    console.log("category", object);
                    return "Category:" + object.category_id; // use `category_id` as the primary key
                case 'User':
                    console.log("user", object);
                    return "User:" + object.uuid; // use `uuid` as the primary key
                case 'Request':
                    console.log("request", object);
                    return "Request:" + object.request_id; // use `request_id` as the primary key
                case 'Item':
                    console.log("item", object);
                    return "Item:" + object.id;
                default:
                    console.warn("UNKNOWN CACHE OBJECT TYPE", object);
                    return defaultDataIdFromObject(object); // fall back to default handling
            }
        }
    }),
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
