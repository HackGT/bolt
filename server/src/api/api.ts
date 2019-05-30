/* tslint:disable:variable-name */
import * as fs from "fs";
import * as path from "path";

import express from "express";
import graphqlHTTP from "express-graphql";
import {buildSchema, GraphQLError} from "graphql";
import {MutationResolvers, QueryResolvers} from "./api.graphql";
import {DB} from "../database";
import {isAdminNoAuthCheck} from "../auth/auth";

const schemaFile = path.join(__dirname, "./api.graphql");
const schema = buildSchema(fs.readFileSync(schemaFile, {encoding: "utf8"}));

export const apiRoutes = express.Router();

// interface IResolver {
//     Query: QueryResolvers<express.Request>;
//     Mutation: MutationResolvers<express.Request>;
// }

// Helper function for incorrect typedefs
// express-graphql does not have a `root` parameter as the first argument but code-gen puts it there anyway
function fixArguments<A, B, C>(fakeRoot: A, fakeArgs: B, fakeContext: C): { args: B, context: C } {
    return {
        args: fakeRoot as unknown as B,
        context: fakeArgs as unknown as C
    };
}


const resolvers: QueryResolvers<express.Request> | MutationResolvers<express.Request> = {
    /* Queries */
    /**
     * Returns information about the current signed in user
     * Access level: current signed in user
     * @param root
     * @param _args
     * @param _context
     */
    user: async (root, _args, _context) => {
        // @ts-ignore
        const {args, context} = fixArguments(root, _args, _context);
        return {
            uuid: context.user.uuid,
            name: context.user.name,
            email: context.user.email,
            phone: context.user.phone,
            slackUsername: context.user.slackUsername,
            haveID: context.user.haveID,
            admin: context.user.admin
        };
    },
    /**
     * Returns information about a single item
     * TODO: better filtering/search
     * Access level: any signed in user
     * @param root
     * @param _args
     * @param _context
     */
    item: async (root, _args, _context) => {
        // @ts-ignore
        const {args, context} = fixArguments(root, _args, _context);

        if (args.id <= 0) {
            throw new GraphQLError("Invalid item ID.  The item ID you provided was <= 0, but item IDs must be >= 1.");
        }

        let item = await DB.from("items")
            .join("categories", "items.category_id", "=", "categories.category_id")
            .where({item_id: args.id});

        if (item.length === 0) {
            return null;
        }
        item = item[0];
        console.log(item);

        console.log({
            id: item.item_id,
            name: item.item_name,
            category: item.category_name,
            ...item
        });
        return {
            id: item.item_id,
            name: item.item_name,
            category: item.category_name,

            ...item
        };
    },
    /**
     * Bulk items API
     * TODO: pagination/returned quantity limit
     * Access level: any signed in user
     * @param root
     * @param _args
     * @param _context
     */
    items: async (root, _args, _context) => {
        // @ts-ignore
        const {args, context} = fixArguments(root, _args, _context);
        const items = await DB.from("items")
            .join("categories", "items.category_id", "=", "categories.category_id");
        console.log(items);

        return items.map(item => {
            return {
                id: item.item_id,
                name: item.item_name,
                category: item.category_name,
                ...item
            };
        });
    },

    /* Mutations */
    /**
     * Create a new item
     * TODO: implement
     * TODO: error handling?
     * Access level: admins
     * @param root
     * @param _args
     * @param _context
     */
    createItem: async (root, _args, _context) => {
        // @ts-ignore
        const {args, context} = fixArguments(root, _args, _context);

        // Restrict endpoint to admins
        if (!context.user.admin) {
            throw new GraphQLError("You do not have permission to access the createItem endpoint");
        }

        const newObjId = await DB.from("items").insert(args.newItem).returning("item_id");

        console.log("The new item's ID is", newObjId);

        return {
            id: 3,
            name: "Arduino",
            description: "",
            imageUrl: "",
            category: "A",
            totalAvailable: 3,
            maxRequestQty: 3,
            price: 3,
            hidden: true,
            returnRequired: true,
            approvalRequired: true,
            owner: ""
        };
    },
};

apiRoutes.post("/", graphqlHTTP({
    schema,
    rootValue: resolvers,
    graphiql: false
}));

apiRoutes.all("/graphiql", isAdminNoAuthCheck, graphqlHTTP({
    schema,
    rootValue: resolvers,
    graphiql: true
}));
