/* tslint:disable:variable-name */
import * as fs from "fs";
import * as path from "path";

import express from "express";
import graphqlHTTP from "express-graphql";
import {buildSchema, GraphQLError} from "graphql";
import {Category, DB} from "../database";
import {isAdminNoAuthCheck} from "../auth/auth";
import {localTimestamp, nestedRequest, onlyIfAdmin, RequestStatus} from "./requests";

const schemaFile = path.join(__dirname, "./api.graphql");
const schema = buildSchema(fs.readFileSync(schemaFile, {encoding: "utf8"}));

export const apiRoutes = express.Router();

// Helper function for incorrect typedefs
// express-graphql does not have a `root` parameter as the first argument but code-gen puts it there anyway
function fixArguments<A, B, C>(fakeRoot: A, fakeArgs: B, fakeContext: C): { args: B, context: C } {
    return {
        args: fakeRoot as unknown as B,
        context: fakeArgs as unknown as C
    };
}

async function getItem(itemId: number, isAdmin: boolean) {
    if (itemId <= 0) {
        throw new GraphQLError("Invalid item ID.  The item ID you provided was <= 0, but item IDs must be >= 1.");
    }

    let item = await DB.from("items")
        .join("categories", "items.category_id", "=", "categories.category_id")
        .where({item_id: itemId});

    if (item.length === 0) {
        return null;
    }
    item = item[0];

    return {
        ...item,
        id: item.item_id,
        category: item.category_name,
        price: onlyIfAdmin(item.price, isAdmin),
        owner: onlyIfAdmin(item.owner, isAdmin)
    };
}

// using any here is slightly yikes but might solve the import .graphql file issue
const resolvers: any = {
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

        return await getItem(args.id, context.user.admin);
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

        return items.map(item => {
            return {
                ...item,
                id: item.item_id,
                category: item.category_name,
                price: onlyIfAdmin(item.price, context.user.admin),
                owner: onlyIfAdmin(item.owner, context.user.admin)
            };
        });
    },
    categories: async (root, _args, _context): Promise<[Category]> => {
        // @ts-ignore
        const {args, context} = fixArguments(root, _args, _context);
        return await DB.from("categories");
    },
    requests: async (root, _args, _context) => {
        // @ts-ignore
        const {args, context} = fixArguments(root, _args, _context);

        const searchObj: any = {};


        if (args.search.item_id) {
            searchObj.item_id = args.search.item_id;
        }

        if (args.search.request_id) {
            searchObj.request_id = args.search.request_id;
        }

        if (args.search.user_id) {
            searchObj.user_id = args.search.user_id;
        }

        if (args.search.status) {
            searchObj.status = args.search.status;
        }

        // If user is not an admin
        if (!context.user.admin) {
            // then if they are requesting requests for a user that is not themselves
            if (args.search.user_id && args.search.user_id !== context.user.uuid) {
                // return an empty array and avoid making a DB query
                return [];
            }

            // otherwise, restrict their results to just their user ID
            searchObj.user_id = context.user.uuid;
        }

        const requests = await DB.from("requests")
            .where(searchObj)
            .join("users", "requests.user_id", "=", "users.uuid")
            .join("items", "requests.request_item_id", "=", "items.item_id")
            .join("categories", "categories.category_id", "=", "items.category_id");

        return requests.map(request => nestedRequest(request, context.user.admin));
    },

    /* Mutations */
    /**
     * Create a new item
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

        if (!args.newItem.item_name.trim().length) {
            throw new GraphQLError("The item name (item_name) can't be empty.");
        }

        if (!args.newItem.category.trim().length) {
            throw new GraphQLError("The category for this item can't be blank.");
        }

        if (args.newItem.totalAvailable < 0) {
            throw new GraphQLError(`The total quantity available (totalQtyAvailable) for a new item can't be less than 0.  Value provided: ${args.newItem.totalAvailable}`);
        }

        if (args.newItem.maxRequestQty < 1) {
            throw new GraphQLError(`The max request quantity (maxRequestQty) must be at least 1.  Value provided: ${args.newItem.maxRequestQty}`);
        }

        if (args.newItem.maxRequestQty > args.newItem.totalAvailable) {
            throw new GraphQLError(`The max request quantity (maxRequestQty) can't be greater than the total quantity of this item (totalAvailable) that is available.  maxRequestQty: ${args.newItem.maxRequestQty}, totalAvailable: ${args.newItem.totalAvailable}`);
        }

        const matchingCategories = await DB.from("categories").where({
            category_name: args.newItem.category
        });

        let categoryId;
        if (!matchingCategories.length) {
            // TODO: what if there's an error here?
            // TODO: currently the category name must be an exact match
            categoryId = await DB.from("categories").insert({
                category_name: args.newItem.category
            }).returning("category_id");
            console.log(categoryId);
            categoryId = categoryId[0];
            console.log(`No existing category named "${args.newItem.category}".  Created a new category with ID ${categoryId}.`);
        } else {
            categoryId = matchingCategories[0].category_id;
            console.log(`Existing category named "${args.newItem.category}" found with ID ${categoryId}.`);
        }

        const savedCategory = args.newItem.category;
        delete args.newItem.category; // Remove the category property from the input item so knex won't try to add it to the database

        const newObjId = await DB.from("items").insert({
            category_id: categoryId,
            ...args.newItem
        }).returning("item_id");

        console.log("The new item's ID is", newObjId[0]);

        return {
            id: newObjId[0],
            category: savedCategory,
            ...args.newItem
        };
    },
    /**
     * Update an existing item given its ID
     * TODO: reduce duplicate code from createItem
     * @param root
     * @param _args
     * @param _context
     */
    updateItem: async (root, _args, _context) => {
        // @ts-ignore
        const {args, context} = fixArguments(root, _args, _context);

        // Restrict endpoint to admins
        if (!context.user.admin) {
            throw new GraphQLError("You do not have permission to access the updateItem endpoint");
        }

        if (!args.id || args.id <= 0) {
            throw new GraphQLError("You must provide a valid item ID (greater than or equal to 0) to update an item.");
        }

        if (!args.updatedItem.item_name.trim().length) {
            throw new GraphQLError("The item name (item_name) can't be empty.");
        }

        if (!args.updatedItem.category.trim().length) {
            throw new GraphQLError("The category for this item can't be blank.");
        }

        if (args.updatedItem.totalAvailable < 0) {
            throw new GraphQLError(`The total quantity available (totalQtyAvailable) for a new item can't be less than 0.  Value provided: ${args.updatedItem.totalAvailable}`);
        }

        if (args.updatedItem.maxRequestQty < 1) {
            throw new GraphQLError(`The max request quantity (maxRequestQty) must be at least 1.  Value provided: ${args.updatedItem.maxRequestQty}`);
        }

        if (args.updatedItem.maxRequestQty > args.updatedItem.totalAvailable) {
            throw new GraphQLError(`The max request quantity (maxRequestQty) can't be greater than the total quantity of this item (totalAvailable) that is available.  maxRequestQty: ${args.updatedItem.maxRequestQty}, totalAvailable: ${args.updatedItem.totalAvailable}`);
        }

        const matchingCategories = await DB.from("categories").where({
            category_name: args.updatedItem.category
        });

        let categoryId;
        if (!matchingCategories.length) {
            // TODO: what if there's an error here?
            // TODO: currently the category name must be an exact match
            categoryId = await DB.from("categories").insert({
                category_name: args.updatedItem.category
            }).returning("category_id");
            console.log(categoryId);
            categoryId = categoryId[0];
            console.log(`No existing category named "${args.updatedItem.category}".  Created a new category with ID ${categoryId}.`);
        } else {
            categoryId = matchingCategories[0].category_id;
            console.log(`Existing category named "${args.updatedItem.category}" found with ID ${categoryId}.`);
        }

        const savedCategory = args.updatedItem.category;
        delete args.updatedItem.category; // Remove the category property from the input item so knex won't try to add it to the database

        await DB.from("items")
            .where({item_id: args.id})
            .update({
                category_id: categoryId,
                ...args.updatedItem
            });

        return {
            id: args.id,
            category: savedCategory,
            ...args.updatedItem
        };
    },
    createRequest: async (root, _args, _context) => {
        // @ts-ignore
        const {args, context} = fixArguments(root, _args, _context);
        // if non-admin, user on request must be user signed in
        // TODO: test this
        if (!context.user.admin && context.user.uuid !== args.newRequest.user_id) {
            throw new GraphQLError("Unable to create request because you are not an admin and your UUID " +
                "does not match the UUID of the user this request is for");
        }

        // make sure the user the request is for exists
        const users = await DB.from("users").where({
            uuid: args.newRequest.user_id
        }).select("name", "email", "uuid", "phone", "slackUsername", "haveID", "admin");

        let user;
        if (users.length === 0) {
            throw new GraphQLError("Unable to create this request because no user with the UUID provided was found");
        } else {
            user = users[0];
        }

        // fetch the item
        const item: any = await getItem(args.newRequest.request_item_id, context.user.admin);

        if (!item) {
            throw new GraphQLError("Can't create request for item that doesn't exist!  Item ID provided: ", args.newRequest.request_item_id);
        }

        // clip item quantity to allowed values
        if (args.newRequest.quantity > item.maxRequestQty) {
            console.log("clipping request quantity (too high), original:", args.newRequest.quantity, ", new:", item.maxRequestQty);
            args.newRequest.quantity = item.maxRequestQty;
        } else if (args.newRequest.quantity < 1) {
            console.log("clipping request quantity (too low), original:", args.newRequest.quantity, ", new:", 1);
            args.newRequest.quantity = 1;
        }

        // TODO: if item has approvalRequired == false, initial status should be APPROVED as long as the total qty
        //       of this item the user has requested
        let initialStatus: RequestStatus = "SUBMITTED";
        console.log("item", item);
        if (!item.approvalRequired) {
            initialStatus = "APPROVED";
        }

        // return the request object with the item, censoring price/owner for non-admins
        let newRequest = await DB.from("requests").insert({
            ...args.newRequest,
            status: initialStatus
        })
            .returning(["request_id", "created_at", "updated_at"]);

        newRequest = newRequest[0];
        return {
            request_id: newRequest.request_id,
            quantity: args.newRequest.quantity,
            status: initialStatus,
            item,
            user,
            createdAt: localTimestamp(newRequest.created_at),
            updatedAt: localTimestamp(newRequest.updated_at)
        };
    },
    deleteRequest: async (root, _args, _context): Promise<boolean> => {
        // @ts-ignore
        const {args, context} = fixArguments(root, _args, _context);

        if (!context.user.admin) {
            throw new GraphQLError("You do not have permission to access the deleteRequest endpoint.");
        }

        const numRowsAffected = await DB.from("requests")
            .where({
                request_id: args.id,
            })
            .del();

        console.log(numRowsAffected);

        return numRowsAffected !== 0;

    }

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
