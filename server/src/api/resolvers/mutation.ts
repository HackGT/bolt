/* eslint-disable camelcase, no-param-reassign */
import { GraphQLError } from "graphql";
import { IResolvers } from "graphql-tools";

import { DB } from "../../database";
import { localTimestamp, toSimpleRequest } from "../requests";
import { Item, Location, Request, RequestStatus, Setting, User } from "../graphql.types";
import { getItemLocation } from "../items/ItemController";
import {
  findOrCreate,
  getItem,
  getUser,
  getSetting,
  REQUEST_CHANGE,
  updateUser,
  pubsub,
} from "./common";

export const Mutation: IResolvers = {
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
      throw new GraphQLError("Unable to retrieve the new item information after creating request");
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
  updateUser: async (root, args, context): Promise<User | null> => await updateUser(args, context),
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
};
