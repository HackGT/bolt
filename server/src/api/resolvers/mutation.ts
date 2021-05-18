/* eslint-disable camelcase, no-param-reassign */
import { GraphQLError } from "graphql";

import { Item, MutationResolvers, Request, RequestStatus, User } from "../graphql.types";
import {
  getItem,
  getUser,
  getSetting,
  REQUEST_CHANGE,
  updateUser,
  pubsub,
  populateItem,
} from "./common";
import { localTimestamp } from "../util";
import { RequestController } from "../controllers/RequestController";
import { prisma } from "../../common";

export const Mutation: MutationResolvers = {
  /* Mutations */
  /**
   * Create a new item
   * TODO: error handling?
   * Access level: admins
   * @param root
   * @param args
   * @param context
   */
  createItem: async (root, args, context) => {
    // Restrict endpoint to admins
    if (!context.user.admin) {
      throw new GraphQLError("You do not have permission to access the createItem endpoint");
    }

    if (!args.newItem.name.trim().length) {
      throw new GraphQLError("The item name can't be empty.");
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

    const item = await prisma.item.create({
      data: {
        ...args.newItem,
        category: {
          connectOrCreate: {
            where: {
              name: args.newItem.category,
            },
            create: {
              name: args.newItem.category,
            },
          },
        },
        location: {
          connectOrCreate: {
            where: {
              name: args.newItem.location,
            },
            create: {
              name: args.newItem.location,
            },
          },
        },
      },
      include: {
        category: true,
        location: true,
      },
    });

    return await populateItem(item, context.user.admin);
  },
  /**
   * Update an existing item given its ID
   * TODO: reduce duplicate code from createItem
   * TODO: should be refactored to be like updateRequest
   * @param root
   * @param args
   * @param context
   */
  updateItem: async (root, args, context) => {
    // Restrict endpoint to admins
    if (!context.user.admin) {
      throw new GraphQLError("You do not have permission to access the updateItem endpoint");
    }

    if (!args.id || args.id <= 0) {
      throw new GraphQLError(
        "You must provide a valid item ID (greater than or equal to 0) to update an item."
      );
    }

    if (!args.updatedItem.name.trim().length) {
      throw new GraphQLError("The item name can't be empty.");
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

    const item = await prisma.item.update({
      where: {
        id: args.id,
      },
      data: {
        ...args.updatedItem,
        category: {
          connectOrCreate: {
            where: {
              name: args.updatedItem.category,
            },
            create: {
              name: args.updatedItem.category,
            },
          },
        },
        location: {
          connectOrCreate: {
            where: {
              name: args.updatedItem.location,
            },
            create: {
              name: args.updatedItem.location,
            },
          },
        },
      },
      include: {
        category: true,
        location: true,
      },
    });

    return await populateItem(item, context.user.admin);
  },
  createRequest: async (root, args, context) => {
    // if non-admin, user on request must be user signed in
    if (!context.user.admin && context.user.uuid !== args.newRequest.userId) {
      throw new GraphQLError(
        "Unable to create request because you are not an admin and your UUID " +
          "does not match the UUID of the user this request is for"
      );
    }

    const user = await getUser(args.newRequest.userId);

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
    const item: Item | null = await getItem(args.newRequest.itemId, context.user.admin);

    if (!item) {
      throw new GraphQLError(
        `Can't create request for item that doesn't exist!  Item ID provided: ${args.newRequest.itemId}`
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

    const newRequest = await prisma.request.create({
      data: {
        ...args.newRequest,
        status: initialStatus,
      },
      include: {
        user: true,
      },
    });

    const updatedItem = await getItem(args.newRequest.itemId, context.user.admin);
    if (!updatedItem) {
      throw new GraphQLError("Unable to retrieve the new item information after creating request");
    }

    const simpleRequest = RequestController.toSimpleRequest(newRequest);

    const result: Request = {
      ...simpleRequest,
      user,
      item: updatedItem,
    };

    pubsub.publish(REQUEST_CHANGE, {
      [REQUEST_CHANGE]: result,
    });

    return {
      id: newRequest.id,
      quantity: args.newRequest.quantity,
      status: initialStatus,
      item: updatedItem,
      location: updatedItem.location,
      user,
      createdAt: localTimestamp(newRequest.createdAt),
      updatedAt: localTimestamp(newRequest.updatedAt),
    };
  },
  deleteRequest: async (root, args, context) => {
    if (!context.user.admin) {
      throw new GraphQLError("You do not have permission to access the deleteRequest endpoint.");
    }

    await prisma.request.delete({
      where: {
        id: args.id,
      },
    });

    return true;
  },
  updateRequest: async (root, args, context) => {
    if (!context.user.admin) {
      throw new GraphQLError("You do not have permission to access the updateRequest endpoint.");
    }

    const updateObj: any = {};

    // Not going to validate against maxRequestQty since only admins can change this currently

    const { quantity } = args.updatedRequest;
    if (quantity && quantity <= 0) {
      throw new GraphQLError(
        `Invalid new requested quantity of ${quantity} specified.  The new requested quantity must be >= 1.`
      );
    }

    // TODO: status change validation logic
    if (args.updatedRequest.status) {
      updateObj.status = args.updatedRequest.status;
    }

    if (args.updatedRequest.quantity) {
      updateObj.quantity = args.updatedRequest.quantity;
    }

    let updatedUserHaveID = null;
    if (typeof args.updatedRequest.userHaveId !== "undefined") {
      updatedUserHaveID = args.updatedRequest.userHaveId;
    }

    if (Object.keys(updateObj).length >= 1) {
      updateObj.updatedAt = new Date();

      const updatedRequest = await prisma.request.update({
        where: {
          id: args.updatedRequest.id,
        },
        data: updateObj,
      });

      const simpleRequest = RequestController.toSimpleRequest(updatedRequest);

      let user: User | null;
      if (updatedUserHaveID !== null) {
        user = await updateUser(
          {
            uuid: updatedRequest.userId,
            updatedUser: {
              haveID: updatedUserHaveID,
            },
          },
          context
        );
      } else {
        user = await getUser(updatedRequest.userId);
      }

      if (!user) {
        throw new GraphQLError("Unknown user");
      }

      // fetch the item
      const item = await getItem(updatedRequest.itemId, context.user.admin);

      if (!item) {
        throw new GraphQLError(
          `Can't create request for item that doesn't exist!  Item ID provided: ${updatedRequest.itemId}`
        );
      }

      if (updatedRequest === null) {
        return null;
      }

      const result: Request = {
        ...simpleRequest,
        user,
        item,
      };

      pubsub.publish(REQUEST_CHANGE, {
        [REQUEST_CHANGE]: result,
      });

      return result;
    }

    return null;
  },
  updateUser: async (root, args, context) => await updateUser(args, context),
  createSetting: async (root, args, context) => {
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

    const setting = await prisma.setting.create({
      data: args.newSetting,
    });

    return setting;
  },
  /**
   * Update an existing setting given its name
   * @param root
   * @param args
   * @param context
   */
  updateSetting: async (root, args, context) => {
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

    const setting = await prisma.setting.update({
      where: {
        name: args.name,
      },
      data: args.updatedSetting,
    });

    return setting;
  },
};
