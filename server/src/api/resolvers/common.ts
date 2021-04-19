/* eslint-disable camelcase */
import { GraphQLError } from "graphql";
import { PubSub } from "graphql-subscriptions";

import { DB, IItem } from "../../database";
import { onlyIfAdmin } from "../util";
import { Item, Setting, User, UserUpdateInput } from "../graphql.types";
import { QuantityController } from "../controllers/QuantityController";
import { ItemController } from "../controllers/ItemController";

export const pubsub = new PubSub();

export const REQUEST_CHANGE = "request_change";

export async function getItem(itemId: number, isAdmin: boolean): Promise<Item | null> {
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
  const { qtyInStock, qtyUnreserved, qtyAvailableForApproval } = await QuantityController.all([
    item_id,
  ]);
  return {
    ...actualItem,
    id: item_id,
    category: actualItem.category_name,
    location: ItemController.getItemLocation(actualItem),
    price: onlyIfAdmin(actualItem.price, isAdmin),
    owner: onlyIfAdmin(actualItem.owner, isAdmin),
    qtyInStock: qtyInStock[item_id],
    qtyUnreserved: qtyUnreserved[item_id],
    qtyAvailableForApproval: qtyAvailableForApproval[item_id],
  };
}

export async function getUser(userId: string) {
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

export async function getSetting(settingName: string) {
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

export async function findOrCreate(
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
