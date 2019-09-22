/* tslint:disable:variable-name */
import * as fs from "fs";
import * as path from "path";

import express from "express";
import graphqlHTTP from "express-graphql";
import {GraphQLError} from "graphql";
import {DB, IItem} from "../database";
import {isAdminNoAuthCheck} from "../auth/auth";
import {localTimestamp, nestedRequest, onlyIfAdmin, toSimpleRequest} from "./requests";
import {makeExecutableSchema} from "graphql-tools";
import {Category, Item, Request, RequestStatus, SimpleRequest, User, UserUpdateInput} from "./graphql.types";
import {PubSub} from "graphql-subscriptions";
import {Quantity} from "./requests/quantity";

export const apiRoutes = express.Router();
export const pubsub = new PubSub();

async function getItem(itemId: number, isAdmin: boolean): Promise<Item|null> {
    if (itemId <= 0) {
        throw new GraphQLError("Invalid item ID.  The item ID you provided was <= 0, but item IDs must be >= 1.");
    }

    const item: IItem[] = await DB.from("items")
        .join("categories", "items.category_id", "=", "categories.category_id")
        .where({item_id: itemId});

    if (item.length === 0) {
        return null;
    }
    const actualItem: any = item[0];
    const {item_id} = actualItem;
    const {qtyInStock, qtyUnreserved, qtyAvailableForApproval} = await Quantity.all(item_id);


    return {
        ...actualItem,
        id: item_id,
        category: actualItem.category_name,
        price: onlyIfAdmin(actualItem.price, isAdmin),
        owner: onlyIfAdmin(actualItem.owner, isAdmin),
        qtyInStock: qtyInStock[item_id],
        qtyUnreserved: qtyUnreserved[item_id],
        qtyAvailableForApproval: qtyAvailableForApproval[item_id]
    };
}

const REQUEST_CHANGE = "request_change";
const resolvers: any = {
    Query: {
        /* Queries */
        /**
         * Returns information about the current signed in user
         * Access level: current signed in user
         * @param root
         * @param args
         * @param context
         */
        user: async (root, args, context): Promise<User> => {
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
        users: async (root, args, context): Promise<User[]> => {
            let searchObj = args.search;

            // Restrict results to current user for non-admins
            if (!context.user.admin) {
                searchObj = {
                    uuid: context.user.uuid
                };
            }

            const colNames: string[] = ["uuid", "name", "haveID", "phone",
                "email", "slackUsername", "admin"];

            return await DB.from("users")
                .where(searchObj)
                .select(colNames)
                .orderBy("name");
        },
        /**
         * Returns information about a single item
         * TODO: better filtering/search
         * Access level: any signed in user
         * @param root
         * @param args
         * @param context
         */
        item: async (root, args, context): Promise<Item | null> => {
            return await getItem(args.id, context.user.admin);
        },
        /**
         * Bulk items API
         * TODO: pagination/returned quantity limit
         * Access level: any signed in user
         * @param root
         * @param args
         * @param context
         */
        items: async (root, args, context): Promise<Item[]> => {
            const items = await DB.from("items")
                .join("categories", "items.category_id", "=", "categories.category_id");

            const {qtyInStock, qtyUnreserved, qtyAvailableForApproval} = await Quantity.all();

            return items.map(item => {
                return {
                    ...item,
                    id: item.item_id,
                    category: item.category_name,
                    price: onlyIfAdmin(item.price, context.user.admin),
                    owner: onlyIfAdmin(item.owner, context.user.admin),
                    qtyInStock: qtyInStock[item.item_id],
                    qtyUnreserved: qtyUnreserved[item.item_id],
                    qtyAvailableForApproval: qtyAvailableForApproval[item.item_id]
                };
            });
        },
        categories: async (root, args, context): Promise<Category[]> => {
            return await DB.from("categories");
        },
        requests: async (root, args, context): Promise<Request[]> => {
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

            let statuses: RequestStatus[] = ["SUBMITTED",
                "APPROVED",
                "DENIED",
                "ABANDONED",
                "CANCELLED",
                "READY_FOR_PICKUP",
                "FULFILLED",
                "RETURNED",
                "LOST",
                "DAMAGED"];

            if (args.search.statuses && args.search.statuses.length) {
                statuses = args.search.statuses;
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
                .whereIn("status", statuses)
                .andWhere(searchObj)
                .join("users", "requests.user_id", "=", "users.uuid")
                .join("items", "requests.request_item_id", "=", "items.item_id")
                .join("categories", "categories.category_id", "=", "items.category_id")
                .orderBy("requests.created_at", "desc");

            return requests.map(request => nestedRequest(request, context.user.admin));
        }
    },
    Mutation: {
        /* Mutations */
        /**
         * Create a new item
         * TODO: error handling?
         * Access level: admins
         * @param root
         * @param args
         * @param context
         */
        createItem: async (root, args, context): Promise<Item> => {
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
         * TODO: should be refactored to be like updateRequest
         * @param root
         * @param args
         * @param context
         */
        updateItem: async (root, args, context): Promise<Item> => {
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
                categoryId = categoryId[0];
                console.log(`No existing category named "${args.updatedItem.category}".  Created a new category with ID ${categoryId}.`);
            } else {
                categoryId = matchingCategories[0].category_id;
                console.log(`Existing category named "${args.updatedItem.category}" found with ID ${categoryId}.`);
            }

            const savedCategory: string = args.updatedItem.category;
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
        createRequest: async (root, args, context): Promise<Request> => {
            // if non-admin, user on request must be user signed in
            if (!context.user.admin && context.user.uuid !== args.newRequest.user_id) {
                throw new GraphQLError("Unable to create request because you are not an admin and your UUID " +
                    "does not match the UUID of the user this request is for");
            }

            // make sure the user the request is for exists
            const users: User[] = await DB.from("users").where({
                uuid: args.newRequest.user_id
            }).select("name", "email", "uuid", "phone", "slackUsername", "haveID", "admin");

            if (users.length === 0) {
                throw new GraphQLError("Unable to create this request because no user with the UUID provided was found");
            }

            const user: User = users[0];

            // fetch the item
            const item: Item | null = await getItem(args.newRequest.request_item_id, context.user.admin);

            if (!item) {
                throw new GraphQLError(`Can't create request for item that doesn't exist!  Item ID provided: ${args.newRequest.request_item_id}`);
            }

            // clip item quantity to allowed values
            if (args.newRequest.quantity > item.maxRequestQty) {
                console.log("clipping request quantity (too high), original:", args.newRequest.quantity, ", new:", item.maxRequestQty);
                args.newRequest.quantity = item.maxRequestQty;
            } else if (args.newRequest.quantity < 1) {
                console.log("clipping request quantity (too low), original:", args.newRequest.quantity, ", new:", 1);
                args.newRequest.quantity = 1;
            }

            const initialStatus: RequestStatus = item.approvalRequired ? "SUBMITTED" : "APPROVED";

            // return the request object with the item, censoring price/owner for non-admins
            let newRequest: any = await DB.from("requests").insert({
                ...args.newRequest,
                status: initialStatus
            })
                .returning(["request_id", "created_at", "updated_at"]);

            newRequest = newRequest[0];

            if (item.qtyUnreserved || item.qtyUnreserved === 0) {
                item.qtyUnreserved -= args.newRequest.quantity;
            }

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
        deleteRequest: async (root, args, context): Promise<boolean> => {
            if (!context.user.admin) {
                throw new GraphQLError("You do not have permission to access the deleteRequest endpoint.");
            }

            const numRowsAffected: number = await DB.from("requests")
                .where({
                    request_id: args.id,
                })
                .del();

            return numRowsAffected !== 0;
        },
        updateRequest: async (root, args, context): Promise<SimpleRequest | null> => {
            if (!context.user.admin) {
                throw new GraphQLError("You do not have permission to access the updateRequest endpoint.");
            }

            const updateObj: any = {};

            // Not going to validate against maxRequestQty since only admins can change this currently

            const newQuantity: number | undefined = args.updatedRequest.new_quantity;
            if (newQuantity && newQuantity <= 0) {
                throw new GraphQLError(`Invalid new requested quantity of ${newQuantity} specified.  The new requested quantity must be >= 1.`);
            }

            // TODO: status change validation logic
            if (args.updatedRequest.new_status) {
                updateObj.status = args.updatedRequest.new_status;
            }

            if (Object.keys(updateObj).length >= 1) {
                updateObj.updated_at = new Date();

                const updatedRequest = await DB.from("requests")
                    .where({
                        request_id: args.updatedRequest.request_id,
                    })
                    .update(updateObj)
                    .returning(["request_id", "quantity", "status", "created_at", "updated_at"]);

                const simpleRequest = toSimpleRequest(updatedRequest[0]);
                console.log(simpleRequest);
                pubsub.publish(REQUEST_CHANGE, {
                    [REQUEST_CHANGE]: simpleRequest
                });


                if (updatedRequest.length === 0) {
                    return null;
                }


                return simpleRequest;
            }

            return null;
        },
        updateUser: async (root, args, context): Promise<User | null> => {
            const searchObj: UserUpdateInput = args.updatedUser;

            if (!context.user.admin && args.uuid !== context.user.uuid) {
                throw new GraphQLError("You do not have permission to update users other than yourself.");
            }

            // non-admins can't change these properties
            if (!context.user.admin) {
                delete searchObj.admin;
                delete searchObj.haveID;
            }

            // don't let an admin remove their own admin permissions
            if (context.user.admin && args.uuid === context.user.uuid) {
                delete searchObj.admin;
            }

            // stop if no properties are going to be updated
            if (!Object.keys(searchObj).length) {
                return null;
            }

            if (searchObj.phone && !(/^\((\d){3}\) (\d){3}-(\d){4}$/).test(searchObj.phone)) {
                throw new GraphQLError("User not updated because phone number format is invalid");
            }

            const updatedUser: User[] = await DB.from("users")
                .where({
                    uuid: args.uuid,
                })
                .update(searchObj)
                .returning(["uuid", "name", "email", "phone", "slackUsername", "haveID", "admin"]);

            if (!updatedUser.length) {
                return null;
            }

            return updatedUser[0];
        },
    },
    Subscription: {
        request_change: {
            subscribe: () => {
                return pubsub.asyncIterator(REQUEST_CHANGE);
            },
            resolve: payload => {
                return payload[REQUEST_CHANGE];
            },
        }
    }
};

const schemaFile = path.join(__dirname, "./api.graphql");
export const schema = makeExecutableSchema({
    typeDefs: fs.readFileSync(schemaFile, {encoding: "utf8"}),
    resolvers
});

apiRoutes.post("/", graphqlHTTP({
    schema,
    graphiql: false
}));

apiRoutes.all("/graphiql", isAdminNoAuthCheck, graphqlHTTP({
    schema,
    graphiql: true
}));
