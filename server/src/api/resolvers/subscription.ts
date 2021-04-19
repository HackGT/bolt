import { IResolvers } from "graphql-tools";

import { pubsub, REQUEST_CHANGE } from "./common";

export const Subscription: IResolvers = {
  request_change: {
    subscribe: () => pubsub.asyncIterator(REQUEST_CHANGE),
    resolve: payload => payload[REQUEST_CHANGE],
  },
};
