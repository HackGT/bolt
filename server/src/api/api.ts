/* eslint-disable camelcase, no-param-reassign */
import * as fs from "fs";
import * as path from "path";
import express from "express";
import { graphqlHTTP } from "express-graphql";
import { GraphQLError } from "graphql";
import { IResolvers, makeExecutableSchema } from "graphql-tools";
import { PubSub } from "graphql-subscriptions";
import fetch from "isomorphic-fetch";

import { DB, IItem } from "../database";
import { isAdminNoAuthCheck } from "../auth/auth";
import { localTimestamp, nestedRequest, onlyIfAdmin, toSimpleRequest } from "./requests";
import {
  Category,
  Item,
  Location,
  Request,
  RequestStatus,
  Setting,
  User,
  UserUpdateInput,
} from "./graphql.types";
import { config } from "../common";
import { Quantity } from "./requests/quantity";
import { getItemLocation, ItemController } from "./items/ItemController";

export const apiRoutes = express.Router();
export const pubsub = new PubSub();

async function getItem(itemId: number, isAdmin: boolean): Promise<Item | null> {
  if (itemId <= 0) {
    throw new GraphQLError(
      "Invalid item ID.  The item ID you provided was <= 0, but item IDs must be >= 1."
    );
  }

  const item: IItem[] = await DB.from("items")
    .join("categories", "items.category_id", "=", "categories.category_id")
    .join("locations", "locations.location_id", "=", "items.location_id")
    .where({ item_id: itemId });

  if (item.length === 0) {
    return null;
  }
  const actualItem: any = item[0];
  const { item_id } = actualItem;
  const { qtyInStock, qtyUnreserved, qtyAvailableForApproval } = await Quantity.all([item_id]);
  return {
    ...actualItem,
    id: item_id,
    category: actualItem.category_name,
    location: getItemLocation(actualItem),
    price: onlyIfAdmin(actualItem.price, isAdmin),
    owner: onlyIfAdmin(actualItem.owner, isAdmin),
    qtyInStock: qtyInStock[item_id],
    qtyUnreserved: qtyUnreserved[item_id],
    qtyAvailableForApproval: qtyAvailableForApproval[item_id],
  };
}

const REQUEST_CHANGE = "request_change";

async function getUser(userId: string) {
  const users: User[] = await DB.from("users")
    .where({
      uuid: userId,
    })
    .select("name", "email", "uuid", "phone", "slackUsername", "haveID", "admin");

  if (users.length === 0) {
    throw new GraphQLError(
      "Unable to create this request because no user with the UUID provided was found"
    );
  }

  return users[0];
}

async function updateUser(args: any, context: any) {
  const searchObj: UserUpdateInput = args.updatedUser;

  if (!context.user.admin && args.uuid !== context.user.uuid) {
    throw new GraphQLError("You do not have permission to update users other than yourself.");
  }

  // non-admins can't change these properties
  if (!context.user.admin) {
    console.log("updateUser: user is not admin");
    delete searchObj.admin;
    delete searchObj.haveID;
  }

  // don't let an admin remove their own admin permissions
  if (context.user.admin && args.uuid === context.user.uuid) {
    delete searchObj.admin;
  }

  // stop if no properties are going to be updated
  if (!Object.keys(searchObj).length) {
    console.log("updateUser: stopping as no properties will be updated");
    return null;
  }

  if (searchObj.phone && !/^\(?(\d){3}\)? ?(\d){3}-?(\d){4}$/.test(searchObj.phone)) {
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
}

async function getSetting(settingName: string) {
  const settings: Setting[] = await DB.from("settings")
    .where({
      name: settingName,
    })
    .select("name", "value");

  if (settings.length === 0) {
    throw new GraphQLError("No setting found");
  }
  return settings[0];
}

async function findOrCreate(
  tableName: string,
  searchObj: Record<string, unknown>,
  data: Record<string, unknown>,
  idFieldName: string
): Promise<number> {
  const matchingRows = await DB.from(tableName).where(searchObj);

  if (!matchingRows.length) {
    // The result must be an exact match
    const id = await DB.from(tableName).returning(idFieldName).insert(data);
    return id[0];
  }
  return matchingRows[0][idFieldName];
}

const resolvers: IResolvers = {
  Query: {
    /* Queries */
    /**
     * Returns information about the current signed in user
     * Access level: current signed in user
     * @param root
     * @param args
     * @param context
     */
    user: async (root, args, context): Promise<User> => ({
      uuid: context.user.uuid,
      name: context.user.name,
      email: context.user.email,
      phone: context.user.phone,
      slackUsername: context.user.slackUsername,
      haveID: context.user.haveID,
      admin: context.user.admin,
    }),
    users: async (root, args, context): Promise<User[]> => {
      let searchObj = args.search;

      // Restrict results to current user for non-admins
      if (!context.user.admin) {
        searchObj = {
          uuid: context.user.uuid,
        };
      }

      const colNames: string[] = [
        "uuid",
        "name",
        "haveID",
        "phone",
        "email",
        "slackUsername",
        "admin",
      ];

      return await DB.from("users").where(searchObj).select(colNames).orderBy("name");
    },
    /**
     * Returns information about a single item
     * TODO: better filtering/search
     * Access level: any signed in user
     * @param root
     * @param args
     * @param context
     */
    item: async (root, args, context): Promise<Item | null> =>
      await getItem(args.id, context.user.admin),
    /**
     * Bulk items API
     * TODO: pagination/returned quantity limit
     * Access level: any signed in user
     * @param root
     * @param args
     * @param context
     */
    allItems: async (root, args, context): Promise<Item[]> => {
      const itemsSearchObj: any = {};
      const locationsSearchObj: any = {};
      if (!context.user.admin) {
        itemsSearchObj.hidden = false;
        locationsSearchObj.location_hidden = false;
      }
      const items = await DB.from("items")
        .where(itemsSearchObj)
        .join("categories", "items.category_id", "=", "categories.category_id");

      const locations: Location[] = await DB.from("locations").where(locationsSearchObj);

      const { qtyInStock, qtyUnreserved, qtyAvailableForApproval } = await Quantity.all();
      const itemsByLocation: any = {};
      for (let i = 0; i < locations.length; i++) {
        const loc = locations[i];

        const itemsAtLocation = items.filter(predItem => predItem.location_id === loc.location_id);
        const itemsByCategory: any = {};

        for (let j = 0; j < itemsAtLocation.length; j++) {
          const item = itemsAtLocation[j];

          if (!Object.prototype.hasOwnProperty.call(itemsByCategory, item.category_id)) {
            itemsByCategory[item.category_id] = {
              category: {
                category_id: item.category_id,
                category_name: item.category_name,
              },
              items: [],
            };
          }
          itemsByCategory[item.category_id].items.push({
            ...item,
            id: item.item_id,
            category: item.category_name,
            location: loc,
            price: onlyIfAdmin(item.price, context.user.admin),
            owner: onlyIfAdmin(item.owner, context.user.admin),
            qtyInStock: qtyInStock[item.item_id],
            qtyUnreserved: qtyUnreserved[item.item_id],
            qtyAvailableForApproval: qtyAvailableForApproval[item.item_id],
          });
        }

        itemsByLocation[loc.location_id] = {
          location: loc,
          categories: Object.values(itemsByCategory).sort((a: any, b: any) =>
            a.category.category_name.localeCompare(b.category.category_name)
          ),
        };
      }

      return Object.values(itemsByLocation);
    },
    categories: (): Promise<Category[]> => DB.from("categories"),
    locations: (): Promise<Location[]> => DB.from("locations"),
    itemStatistics: async (root, args, context): Promise<Item[]> => {
      if (!context.user.admin) {
        // TODO: validate this
        throw new GraphQLError("You do not have permission to access this endpoint");
      }

      const items: any = await ItemController.get({}, context.user.admin);
      const detailedQuantities = await Quantity.quantityStatistics();

      return items.map((item: any) => {
        const qtyInfo = detailedQuantities[item.item_id] || {
          SUBMITTED: 0,
          APPROVED: 0,
          DENIED: 0,
          ABANDONED: 0,
          CANCELLED: 0,
          READY_FOR_PICKUP: 0,
          FULFILLED: 0,
          RETURNED: 0,
          LOST: 0,
          DAMAGED: 0,
          total: 0,
        };
        return {
          item,
          detailedQuantities: qtyInfo,
        };
      });
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

      let statuses: RequestStatus[] = [
        "SUBMITTED",
        "APPROVED",
        "DENIED",
        "ABANDONED",
        "CANCELLED",
        "READY_FOR_PICKUP",
        "FULFILLED",
        "RETURNED",
        "LOST",
        "DAMAGED",
      ];

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
        searchObj.location_hidden = false; // don't show hidden locations
        searchObj.hidden = false; // don't show hidden items
      }

      const requests = await DB.from("requests")
        .whereIn("status", statuses)
        .andWhere(searchObj)
        .join("users", "requests.user_id", "=", "users.uuid")
        .join("items", "requests.request_item_id", "=", "items.item_id")
        .join("categories", "categories.category_id", "=", "items.category_id")
        .join("locations", "locations.location_id", "=", "items.location_id")
        .orderBy("requests.created_at", "asc");

      const items: number[] = [];

      requests.forEach(value => {
        if (items.indexOf(value.request_item_id) === -1) {
          items.push(value.request_item_id);
        }
      });

      const { qtyInStock, qtyUnreserved, qtyAvailableForApproval } = await Quantity.all(items);

      return requests.map(request =>
        nestedRequest(
          request,
          context.user.admin,
          qtyInStock,
          qtyAvailableForApproval,
          qtyUnreserved
        )
      );
    },
    setting: async (root, args): Promise<Setting | null> => await getSetting(args.name),
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
    createItem: async (root, args, context): Promise<Item | null> => {
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

      if (!args.newItem.location.trim().length) {
        throw new GraphQLError("The location for this item can't be blank.");
      }

      if (args.newItem.totalAvailable < 0) {
        throw new GraphQLError(
          `The total quantity available (totalQtyAvailable) for a new item can't be less than 0.  Value provided: ${args.newItem.totalAvailable}`
        );
      }

      if (args.newItem.maxRequestQty < 1) {
        throw new GraphQLError(
          `The max request quantity (maxRequestQty) must be at least 1.  Value provided: ${args.newItem.maxRequestQty}`
        );
      }

      if (args.newItem.maxRequestQty > args.newItem.totalAvailable) {
        throw new GraphQLError(
          `The max request quantity (maxRequestQty) can't be greater than the total quantity of this item (totalAvailable) that is available.  maxRequestQty: ${args.newItem.maxRequestQty}, totalAvailable: ${args.newItem.totalAvailable}`
        );
      }

      const categoryObj = { category_name: args.newItem.category };
      const category_id = await findOrCreate("categories", categoryObj, categoryObj, "category_id");

      const locationObj = {
        location_name: args.newItem.location,
      };
      const location_id = await findOrCreate("locations", locationObj, locationObj, "location_id");

      delete args.newItem.category; // Remove the category property from the input item so knex won't try to add it to the database
      delete args.newItem.location;

      const newObjId = await DB.from("items")
        .returning("item_id")
        .insert({
          category_id,
          location_id,
          ...args.newItem,
        });

      console.log("The new item's ID is", newObjId[0]);

      return await getItem(newObjId[0], context.user.admin);
    },
    /**
     * Update an existing item given its ID
     * TODO: reduce duplicate code from createItem
     * TODO: should be refactored to be like updateRequest
     * @param root
     * @param args
     * @param context
     */
    updateItem: async (root, args, context): Promise<Item | null> => {
      // Restrict endpoint to admins
      if (!context.user.admin) {
        throw new GraphQLError("You do not have permission to access the updateItem endpoint");
      }

      if (!args.id || args.id <= 0) {
        throw new GraphQLError(
          "You must provide a valid item ID (greater than or equal to 0) to update an item."
        );
      }

      if (!args.updatedItem.item_name.trim().length) {
        throw new GraphQLError("The item name (item_name) can't be empty.");
      }

      if (!args.updatedItem.category.trim().length) {
        throw new GraphQLError("The category for this item can't be blank.");
      }

      if (!args.updatedItem.location.trim().length) {
        throw new GraphQLError("The location for this item can't be blank.");
      }

      if (args.updatedItem.totalAvailable < 0) {
        throw new GraphQLError(
          `The total quantity available (totalQtyAvailable) for a new item can't be less than 0.  Value provided: ${args.updatedItem.totalAvailable}`
        );
      }

      if (args.updatedItem.maxRequestQty < 1) {
        throw new GraphQLError(
          `The max request quantity (maxRequestQty) must be at least 1.  Value provided: ${args.updatedItem.maxRequestQty}`
        );
      }

      if (args.updatedItem.maxRequestQty > args.updatedItem.totalAvailable) {
        throw new GraphQLError(
          `The max request quantity (maxRequestQty) can't be greater than the total quantity of this item (totalAvailable) that is available.  maxRequestQty: ${args.updatedItem.maxRequestQty}, totalAvailable: ${args.updatedItem.totalAvailable}`
        );
      }

      const categoryObj = { category_name: args.updatedItem.category };
      const category_id = await findOrCreate("categories", categoryObj, categoryObj, "category_id");

      const locationObj = {
        location_name: args.updatedItem.location,
      };
      const location_id = await findOrCreate("locations", locationObj, locationObj, "location_id");

      delete args.updatedItem.category; // Remove the category property from the input item so knex won't try to add it to the database
      delete args.updatedItem.location;
      await DB.from("items")
        .where({ item_id: args.id })
        .update({
          category_id,
          location_id,
          ...args.updatedItem,
        });

      return await getItem(args.id, context.user.admin);
    },
    createRequest: async (root, args, context): Promise<Request> => {
      // if non-admin, user on request must be user signed in
      if (!context.user.admin && context.user.uuid !== args.newRequest.user_id) {
        throw new GraphQLError(
          "Unable to create request because you are not an admin and your UUID " +
            "does not match the UUID of the user this request is for"
        );
      }

      const user = await getUser(args.newRequest.user_id);

      // check requests_allowed setting status
      let requests_allowed;
      try {
        requests_allowed = await getSetting("requests_allowed");
      } catch (error) {
        console.log("Could not find requests_allowed setting");
      }

      // eslint-disable-next-line eqeqeq
      if (requests_allowed !== undefined && requests_allowed.value == "false") {
        console.log("Requests are disabled at this time");
        throw new GraphQLError("Requests are disabled at this time");
      }

      // fetch the item
      const item: Item | null = await getItem(args.newRequest.request_item_id, context.user.admin);

      if (!item) {
        throw new GraphQLError(
          `Can't create request for item that doesn't exist!  Item ID provided: ${args.newRequest.request_item_id}`
        );
      }

      // clip item quantity to allowed values
      if (args.newRequest.quantity > item.maxRequestQty) {
        console.log(
          "clipping request quantity (too high), original:",
          args.newRequest.quantity,
          ", new:",
          item.maxRequestQty
        );
        args.newRequest.quantity = item.maxRequestQty;
      } else if (args.newRequest.quantity < 1) {
        console.log(
          "clipping request quantity (too low), original:",
          args.newRequest.quantity,
          ", new:",
          1
        );
        args.newRequest.quantity = 1;
      }

      const initialStatus: RequestStatus =
        !item.approvalRequired && item.qtyUnreserved >= args.newRequest.quantity
          ? "APPROVED"
          : "SUBMITTED";

      let newRequest: any = await DB.from("requests")
        .insert({
          ...args.newRequest,
          status: initialStatus,
        })
        .returning(["request_id", "quantity", "status", "created_at", "updated_at"]);

      // eslint-disable-next-line prefer-destructuring
      newRequest = newRequest[0];
      const updatedItem = await getItem(args.newRequest.request_item_id, context.user.admin);
      if (!updatedItem) {
        throw new GraphQLError(
          "Unable to retrieve the new item information after creating request"
        );
      }

      const simpleRequest = toSimpleRequest(newRequest);

      const result: Request = {
        ...simpleRequest,
        user,
        item: updatedItem,
        location: updatedItem.location,
      };

      pubsub.publish(REQUEST_CHANGE, {
        [REQUEST_CHANGE]: result,
      });

      return {
        request_id: newRequest.request_id,
        quantity: args.newRequest.quantity,
        status: initialStatus,
        item: updatedItem,
        location: updatedItem.location,
        user,
        createdAt: localTimestamp(newRequest.created_at),
        updatedAt: localTimestamp(newRequest.updated_at),
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
    updateRequest: async (root, args, context): Promise<Request | null> => {
      if (!context.user.admin) {
        throw new GraphQLError("You do not have permission to access the updateRequest endpoint.");
      }

      const updateObj: any = {};

      // Not going to validate against maxRequestQty since only admins can change this currently

      const newQuantity: number | undefined = args.updatedRequest.new_quantity;
      if (newQuantity && newQuantity <= 0) {
        throw new GraphQLError(
          `Invalid new requested quantity of ${newQuantity} specified.  The new requested quantity must be >= 1.`
        );
      }

      // TODO: status change validation logic
      if (args.updatedRequest.new_status) {
        updateObj.status = args.updatedRequest.new_status;
      }

      if (args.updatedRequest.new_quantity) {
        updateObj.quantity = args.updatedRequest.new_quantity;
      }

      let updatedUserHaveID = null;
      if (typeof args.updatedRequest.user_haveID !== "undefined") {
        updatedUserHaveID = args.updatedRequest.user_haveID;
      }

      if (Object.keys(updateObj).length >= 1) {
        updateObj.updated_at = new Date();

        const updatedRequest: any = await DB.from("requests")
          .where({
            request_id: args.updatedRequest.request_id,
          })
          .update(updateObj)
          .returning([
            "request_id",
            "quantity",
            "status",
            "created_at",
            "updated_at",
            "user_id",
            "request_item_id",
          ]);

        const simpleRequest = toSimpleRequest(updatedRequest[0]);
        console.log(simpleRequest);

        let user: User | null;
        if (updatedUserHaveID !== null) {
          user = await updateUser(
            {
              uuid: updatedRequest[0].user_id,
              updatedUser: {
                haveID: updatedUserHaveID,
              },
            },
            context
          );
        } else {
          user = await getUser(updatedRequest[0].user_id);
        }

        if (!user) {
          throw new GraphQLError("Unknown user");
        }

        // fetch the item
        const item: Item | null = await getItem(
          updatedRequest[0].request_item_id,
          context.user.admin
        );

        const location: Location | null = getItemLocation(item);

        if (!item) {
          throw new GraphQLError(
            `Can't create request for item that doesn't exist!  Item ID provided: ${args.newRequest.request_item_id}`
          );
        }

        if (updatedRequest.length === 0) {
          return null;
        }

        const result: Request = {
          ...simpleRequest,
          user,
          item,
          location,
        };

        pubsub.publish(REQUEST_CHANGE, {
          [REQUEST_CHANGE]: result,
        });

        return result;
      }

      return null;
    },
    updateUser: async (root, args, context): Promise<User | null> =>
      await updateUser(args, context),
    createSetting: async (root, args, context): Promise<Setting> => {
      // Restrict endpoint to admins
      if (!context.user.admin) {
        throw new GraphQLError("You do not have permission to access the createSetting endpoint");
      }

      if (!args.newSetting.name.trim().length) {
        throw new GraphQLError("The setting name (name) can't be empty.");
      }

      if (!args.newSetting.value.trim().length) {
        throw new GraphQLError("The value for this setting can't be blank.");
      }

      const newObjName = await DB.from<Setting>("settings")
        .insert({
          name: args.newSetting.name,
          value: args.newSetting.value,
        })
        .returning("name");

      console.log("The new setting's name is", newObjName[0]);

      return {
        name: newObjName[0],
        value: args.newSetting.value,
      };
    },
    /**
     * Update an existing setting given its name
     * @param root
     * @param args
     * @param context
     */
    updateSetting: async (root, args, context): Promise<Setting> => {
      // Restrict endpoint to admins
      if (!context.user.admin) {
        throw new GraphQLError("You do not have permission to access the updateSetting endpoint");
      }

      if (!args.name.trim().length) {
        throw new GraphQLError("You must provide a valid setting name to update a setting.");
      }

      if (!args.updatedSetting.value.trim().length) {
        throw new GraphQLError("The value can't be empty.");
      }

      await DB.from("settings").where({ name: args.name }).update({
        name: args.updatedSetting.name,
        value: args.updatedSetting.value,
      });

      return {
        name: args.updatedSetting.name,
        value: args.updatedSetting.value,
      };
    },
  },
  Subscription: {
    request_change: {
      subscribe: () => pubsub.asyncIterator(REQUEST_CHANGE),
      resolve: payload => payload[REQUEST_CHANGE],
    },
  },
};

const schemaFile = path.join(__dirname, "./api.graphql");
export const schema = makeExecutableSchema({
  typeDefs: fs.readFileSync(schemaFile, { encoding: "utf8" }),
  resolvers,
});

apiRoutes.post(
  "/",
  graphqlHTTP({
    schema,
    graphiql: false,
  })
);

apiRoutes.all(
  "/graphiql",
  isAdminNoAuthCheck,
  graphqlHTTP({
    schema,
    graphiql: true,
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
