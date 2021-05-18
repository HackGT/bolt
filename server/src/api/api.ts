import * as fs from "fs";
import * as path from "path";
import express from "express";
import { graphqlHTTP } from "express-graphql";
import { IResolvers, makeExecutableSchema } from "graphql-tools";
import fetch from "isomorphic-fetch";
import { GraphQLError, GraphQLFormattedError } from "graphql";

import { isAdminNoAuthCheck } from "../auth/auth";
import { User } from "./graphql.types";
import { config } from "../common";
import { Query } from "./resolvers/query";
import { Mutation } from "./resolvers/mutation";
import { Subscription } from "./resolvers/subscription";

export const apiRoutes = express.Router();

const resolvers: IResolvers = { Query, Mutation, Subscription };

const schemaFile = path.join(__dirname, "./api.graphql");
export const schema = makeExecutableSchema({
  typeDefs: fs.readFileSync(schemaFile, { encoding: "utf8" }),
  resolvers,
});

const customFormatErrorFn: (
  error: GraphQLError
) => GraphQLFormattedError<Record<string, any>> = error => {
  const output = {
    message: error.message,
    locations: error.locations,
    stack: error.stack ? error.stack.split("\n") : [],
    path: error.path,
  };
  console.error(output);
  return output;
};

apiRoutes.post(
  "/",
  graphqlHTTP({
    schema,
    graphiql: false,
    pretty: true,
    customFormatErrorFn,
  })
);

apiRoutes.all(
  "/graphiql",
  isAdminNoAuthCheck,
  graphqlHTTP({
    schema,
    graphiql: true,
    pretty: true,
    customFormatErrorFn,
  })
);

apiRoutes.post("/slack/feedback", express.json(), (req, res) => {
  const user = req.user as User;

  fetch(config.server.slackURL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      attachments: [
        {
          fallback: req.body.fallback,
          color: req.body.color,
          fields: [
            {
              title: "Feedback Type",
              value: req.body.title,
            },
            {
              title: "Comment",
              value: req.body.text,
            },
            {
              title: "URL",
              value: req.body.title_link,
            },
            {
              title: "Name",
              value: user.name,
            },
            {
              title: "UUID",
              value: user.uuid,
            },
            {
              title: "Email",
              value: user.email,
            },
            {
              title: "Slack Username",
              value: user.slackUsername,
            },
            {
              title: "Admin",
              value: user.admin ? "Yes" : "No",
            },
          ],
        },
      ],
    }),
  })
    .then(response =>
      res.status(response.status).send({
        status: response.status,
        statusText: response.statusText,
      })
    )
    .catch(error => res.status(500).send(error.toString()));
});
