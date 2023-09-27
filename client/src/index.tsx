import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import "./index.css";
import { ChakraProvider } from "@chakra-ui/react";
import { createRoot } from "react-dom/client";

import { App } from "./App";
// import React from "react";
// import { createRoot } from "react-dom/client";
// import { Provider } from "react-redux";
// import Bugsnag from "@bugsnag/js";
// import BugsnagPluginReact from "@bugsnag/plugin-react";
// import { SubscriptionClient } from "subscriptions-transport-ws";
// import { getMainDefinition } from "@apollo/client/utilities";
// import { HttpLink, ApolloClient, InMemoryCache } from "@apollo/client";
// import { ApolloProvider } from "@apollo/client/react";
// import { RetryLink } from "@apollo/client/link/retry";
// import { WebSocketLink } from "@apollo/client/link/ws";

// import packageJson from "../package.json";
// import { store } from "./state/Store";
// import App from "./App";

// import "./index.css";
// import { ChakraProvider } from "@chakra-ui/react";
// import { BrowserRouter } from "react-router-dom";
// import { AuthContext } from "@hex-labs/core";

// const httpLink = new HttpLink({
//   uri: "/api",
//   credentials: "include",
// });

// // @ts-ignore
// global.appVersion = packageJson.version;

// const wsProtocol = window.location.protocol === "http:" ? "ws" : "wss";
// const wsHost =
//   !process.env.NODE_ENV || process.env.NODE_ENV === "development"
//     ? "localhost:3000"
//     : window.location.host;
// const wsUrl = `${wsProtocol}://${wsHost}/api`;
// const wsClient = new SubscriptionClient(wsUrl, {
//   reconnect: true,
// });
// const wsLink = new WebSocketLink(wsClient);
// const link = new RetryLink().split(
//   // split based on operation type
//   ({ query }) => {
//     const definition = getMainDefinition(query);
//     return definition.kind === "OperationDefinition" && definition.operation === "subscription";
//   },
//   wsLink,
//   httpLink
// );

// export const client = new ApolloClient({
//   link,
//   cache: new InMemoryCache({
//     typePolicies: {
//       // specify custom primary keys for certain types for caching
//       Location: {
//         keyFields: ["id"],
//       },
//       Category: {
//         keyFields: ["id"],
//       },
//       User: {
//         keyFields: ["uuid"],
//       },
//       Request: {
//         keyFields: ["id"],
//       },
//       Setting: {
//         keyFields: ["name"],
//       },
//     },
//   }),
//   defaultOptions: {
//     query: {
//       errorPolicy: "all",
//     },
//   },
// });

// export const bugsnagEnabled = process.env.REACT_APP_ENABLE_BUGSNAG?.toLowerCase() === "true";
// // eslint-disable-next-line import/no-mutable-exports
// export let bugsnagClient: any;

// const container = document.getElementById("root");
// const root = createRoot(container!);

// if (bugsnagEnabled) {
//   bugsnagClient = Bugsnag.start({
//     apiKey: process.env.REACT_APP_BUGSNAG_API_KEY as string,
//     appVersion: `${packageJson.version}`,
//   });
//   bugsnagClient.use(BugsnagPluginReact, React);
//   const ErrorBoundary = bugsnagClient.getPlugin("react");
//   root.render(
//     <ErrorBoundary>
//       <ApolloProvider client={client}>
//         <Provider store={store}>
//           <App />
//         </Provider>
//       </ApolloProvider>
//     </ErrorBoundary>
//   );
// } else {
//   root.render(
//     <ApolloProvider client={client}>
//       <Provider store={store}>
//         <App />
//       </Provider>
//     </ApolloProvider>
//   );
// }

const container = document.getElementById("root");
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <ChakraProvider>
      <Router>
        <App />
      </Router>
    </ChakraProvider>
  </React.StrictMode>
);
