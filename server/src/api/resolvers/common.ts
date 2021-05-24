import { GraphQLError } from "graphql";
import { PubSub } from "graphql-subscriptions";
import { Category, Setting, Location, Item, Request } from "@prisma/client";

import { localTimestamp, onlyIfAdmin } from "../util";
import { Item as GraphQLItem } from "../graphql.types";
import { ItemAllQtys, QuantityController } from "../controllers/QuantityController";
import { prisma } from "../../common";

export const pubsub = new PubSub();

export const REQUEST_CHANGE = "requestChange";

export function populateItem(
  item: Item & { location: Location; category: Category },
  isAdmin: boolean,
  itemQuantities: ItemAllQtys
): GraphQLItem {
  return {
    ...item,
    ...itemQuantities[item.id],
    price: onlyIfAdmin(item.price, isAdmin),
    owner: onlyIfAdmin(item.owner, isAdmin),
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

  const itemQuantities = await QuantityController.all([itemId]);
  return populateItem(item, isAdmin, itemQuantities);
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

export function toSimpleRequest(request: Request) {
  return {
    id: request.id,
    status: request.status,
    quantity: request.quantity,
    createdAt: localTimestamp(request.createdAt),
    updatedAt: localTimestamp(request.updatedAt),
  };
}
