import { GraphQLError } from "graphql";
import { IResolvers } from "graphql-tools";

import { DB } from "../../database";
import { onlyIfAdmin } from "../util";
import { Category, Item, Location, Request, RequestStatus, Setting, User } from "../graphql.types";
import { QuantityController } from "../controllers/QuantityController";
import { ItemController } from "../controllers/ItemController";
import { getItem, getSetting } from "./common";
import { RequestController } from "../controllers/RequestController";

export const Query: IResolvers = {
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

    const { qtyInStock, qtyUnreserved, qtyAvailableForApproval } = await QuantityController.all();
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
    const detailedQuantities = await QuantityController.quantityStatistics();

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

    const { qtyInStock, qtyUnreserved, qtyAvailableForApproval } = await QuantityController.all(
      items
    );

    return requests.map(request =>
      RequestController.nestedRequest(
        request,
        context.user.admin,
        qtyInStock,
        qtyAvailableForApproval,
        qtyUnreserved
      )
    );
  },
  setting: async (root, args): Promise<Setting | null> => await getSetting(args.name),
};
