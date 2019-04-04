import * as fs from "fs";
import * as path from "path";

import express from "express";
import graphqlHTTP from "express-graphql";
import { buildSchema } from "graphql";

const schemaFile = path.join(__dirname, "./api.graphql");
const schema = buildSchema(fs.readFileSync(schemaFile, { encoding: "utf8" }));

export const apiRoutes = express.Router();

import { QueryResolvers } from "./api.graphql";
const resolvers: QueryResolvers = {
	me: async (root, args, context) => {
		return {
			id: "yo",
			name: "Ryan"
		};
	}
};

apiRoutes.post("/", graphqlHTTP({
	schema,
	rootValue: resolvers,
	graphiql: false
}));

apiRoutes.all("/graphiql", graphqlHTTP({
	schema,
	rootValue: resolvers,
	graphiql: true
}));
