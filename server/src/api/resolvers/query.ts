import { GraphQLError } from "graphql";

import { onlyIfAdmin } from "../util";
import { QueryResolvers, RequestStatus } from "../graphql.types";
import { QuantityController } from "../controllers/QuantityController";
import { ItemController } from "../controllers/ItemController";
import { getItem, getSetting } from "./common";
import { RequestController } from "../controllers/RequestController";
import { prisma } from "../../common";

export const Query: QueryResolvers = {
  /* Queries */
  /**
   * Returns information about the current signed in user
   * Access level: current signed in user
   * @param root
   * @param args
   * @param context
   */
  user: async (root, args, context) => ({
    uuid: context.user.uuid,
    name: context.user.name,
    email: context.user.email,
    phone: context.user.phone,
    slackUsername: context.user.slackUsername,
    haveID: context.user.haveID,
    admin: context.user.admin,
  }),
  users: async (root, args, context) => {
    let searchObj = args.search;

    // Restrict results to current user for non-admins
    if (!context.user.admin) {
      searchObj = {
        uuid: context.user.uuid,
      };
    }

    return await prisma.user.findMany({
      where: {
        uuid: searchObj.uuid || undefined,
        name: searchObj.name || undefined,
        haveID: searchObj.haveID || undefined,
        phone: searchObj.phone || undefined,
        email: searchObj.email || undefined,
        slackUsername: searchObj.slackUsername || undefined,
        admin: searchObj.admin || undefined,
      },
      orderBy: {
        name: "asc",
      },
    });
  },
  /**
   * Returns information about a single item
   * TODO: better filtering/search
   * Access level: any signed in user
   * @param root
   * @param args
   * @param context
   */
  item: async (root, args, context) => await getItem(args.id, context.user.admin),
  /**
   * Bulk items API
   * TODO: pagination/returned quantity limit
   * Access level: any signed in user
   * @param root
   * @param args
   * @param context
   */
  allItems: async (root, args, context) => {
    const itemsSearchObj: any = {};
    const locationsSearchObj: any = {};
    if (!context.user.admin) {
      itemsSearchObj.hidden = false;
      locationsSearchObj.hidden = false;
    }
    const items = await prisma.item.findMany({
      where: itemsSearchObj,
      include: {
        location: true,
        category: true,
      },
    });

    const locations = await prisma.location.findMany({
      where: locationsSearchObj,
    });

    const { qtyInStock, qtyUnreserved, qtyAvailableForApproval } = await QuantityController.all();
    const itemsByLocation: any = {};
    for (let i = 0; i < locations.length; i++) {
      const loc = locations[i];

      const itemsAtLocation = items.filter(predItem => predItem.locationId === loc.id);
      const itemsByCategory: any = {};

      for (let j = 0; j < itemsAtLocation.length; j++) {
        const item = itemsAtLocation[j];

        if (!Object.prototype.hasOwnProperty.call(itemsByCategory, item.categoryId)) {
          itemsByCategory[item.categoryId] = {
            category: {
              id: item.categoryId,
              name: item.category.name,
            },
            items: [],
          };
        }
        itemsByCategory[item.categoryId].items.push({
          ...item,
          price: onlyIfAdmin(item.price, context.user.admin),
          owner: onlyIfAdmin(item.owner, context.user.admin),
          qtyInStock: qtyInStock[item.id],
          qtyUnreserved: qtyUnreserved[item.id],
          qtyAvailableForApproval: qtyAvailableForApproval[item.id],
        });
      }

      itemsByLocation[loc.id] = {
        location: loc,
        categories: Object.values(itemsByCategory).sort((a: any, b: any) =>
          a.category.name.localeCompare(b.category.name)
        ),
      };
    }

    return Object.values(itemsByLocation);
  },
  categories: async () => await prisma.category.findMany(),
  locations: async () => await prisma.location.findMany(),
  itemStatistics: async (root, args, context) => {
    if (!context.user.admin) {
      // TODO: validate this
      throw new GraphQLError("You do not have permission to access this endpoint");
    }

    const items: any = await ItemController.get({}, context.user.admin);
    const detailedQuantities = await QuantityController.quantityStatistics();

    return items.map((item: any) => {
      const qtyInfo = detailedQuantities[item.id] || {
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
  requests: async (root, args, context) => {
    const searchObj: any = {};

    if (args.search.itemId) {
      searchObj.itemId = args.search.itemId;
    }

    if (args.search.id) {
      searchObj.id = args.search.id;
    }

    if (args.search.userId) {
      searchObj.userId = args.search.userId;
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
      if (args.search.userId && args.search.userId !== context.user.uuid) {
        // return an empty array and avoid making a DB query
        return [];
      }

      // otherwise, restrict their results to just their user ID
      searchObj.userId = context.user.uuid;
      searchObj.item.location.hidden = false; // don't show hidden locations
      searchObj.item.hidden = false; // don't show hidden items
    }

    const requests = await prisma.request.findMany({
      where: {
        status: {
          in: statuses.length === 0 ? undefined : statuses,
        },
        ...searchObj,
      },
      include: {
        user: true,
        item: {
          include: {
            category: true,
            location: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const items: number[] = [];

    requests.forEach(value => {
      if (items.indexOf(value.itemId) === -1) {
        items.push(value.itemId);
      }
    });

    return requests.map(request =>
      RequestController.toNestedRequest(request, context.user.admin, items)
    );
  },
  setting: async (root, args) => await getSetting(args.name),
};
