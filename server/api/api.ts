import * as fs from "fs";
import * as path from "path";

import express from "express";
import graphqlHTTP from "express-graphql";
import { buildSchema } from "graphql";

const schemaFile = path.join(__dirname, "./api.graphql");
const schema = buildSchema(fs.readFileSync(schemaFile, { encoding: "utf8" }));

export const apiRoutes = express.Router();

import { QueryResolvers } from "./api.graphql";
// Helper function for incorrect typedefs
// express-graphql does not have a `root` parameter as the first argument but code-gen puts it there anyway
function fixArguments<A, B, C>(fakeRoot: A, fakeArgs: B, fakeContext: C): { args: B, context: C } {
	return {
		args: fakeRoot as unknown as B,
		context: fakeArgs as unknown as C
	};
}


const resolvers: QueryResolvers<express.Request> = {
	user: async (root, _args, _context) => {
		let { args, context } = fixArguments(root, _args, _context);
		return {
			uuid: context.user.uuid,
			name: context.user.name,
			email: context.user.email,
			phone: context.user.phone,
			slackUsername: context.user.slackUsername,
			haveID: context.user.haveID,
			admin: context.user.admin
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
