import { GraphQLError } from "graphql";
import { PubSub } from "graphql-subscriptions";
import { Category, Setting, Location, Item } from "@prisma/client";

import { onlyIfAdmin } from "../util";
import { Item as GraphQLItem, UserUpdateInput } from "../graphql.types";
import { QuantityController } from "../controllers/QuantityController";
import { prisma } from "../../common";

export const pubsub = new PubSub();

export const REQUEST_CHANGE = "requestChange";

export async function populateItem(
  item: Item & { location: Location; category: Category },
  isAdmin: boolean
): Promise<GraphQLItem> {
  const { qtyInStock, qtyUnreserved, qtyAvailableForApproval } = await QuantityController.all([
    item.id,
  ]);

  return {
    ...item,
    price: onlyIfAdmin(item.price, isAdmin),
    owner: onlyIfAdmin(item.owner, isAdmin),
    qtyInStock: qtyInStock[item.id],
    qtyUnreserved: qtyUnreserved[item.id],
    qtyAvailableForApproval: qtyAvailableForApproval[item.id],
  };
}

export async function getItem(itemId: number, isAdmin: boolean): Promise<GraphQLItem | null> {
  if (itemId <= 0) {
    throw new GraphQLError(
      "Invalid item ID.  The item ID you provided was <= 0, but item IDs must be >= 1."
    );
  }

  const item = await prisma.item.findFirst({
    where: {
      id: itemId,
    },
    include: {
      location: true,
      category: true,
    },
  });

  if (item === null) {
    return null;
  }

  return populateItem(item, isAdmin);
}

export async function getUser(userId: string) {
  const user = await prisma.user.findFirst({
    where: {
      uuid: userId,
    },
  });

  if (user === null) {
    throw new GraphQLError(
      "Unable to create this request because no user with the UUID provided was found"
    );
  }

  return user;
}

export async function updateUser(args: any, context: any) {
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

  const user = prisma.user.update({
    where: {
      uuid: args.uuid,
    },
    data: {
      ...searchObj,
      phone: searchObj.phone ?? undefined,
      slackUsername: searchObj.slackUsername ?? undefined,
      haveID: searchObj.haveID ?? undefined,
      admin: searchObj.admin ?? undefined,
    },
  });

  return user;
}

export async function getSetting(settingName: string): Promise<Setting> {
  const setting = prisma.setting.findFirst({
    where: {
      name: settingName,
    },
  });

  if (setting === null) {
    throw new GraphQLError("No setting found");
  }

  // @ts-ignore
  return setting;
}
