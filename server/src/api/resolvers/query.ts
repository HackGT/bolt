import { GraphQLError } from "graphql";

import { ItemsByCategory, ItemsByLocation, QueryResolvers, RequestStatus } from "../graphql.types";
import { QuantityController } from "../controllers/QuantityController";
import { getItem, getSetting, populateItem, populateRequest } from "./common";
import { prisma } from "../../common";

export const Query: QueryResolvers = {
  /* Queries */
  /**
   * Returns information about the current signed in user
   * Access level: current signed in user
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
        uuid: searchObj.uuid ?? undefined,
        name: searchObj.name ?? undefined,
        haveID: searchObj.haveID ?? undefined,
        phone: searchObj.phone ?? undefined,
        email: searchObj.email ?? undefined,
        slackUsername: searchObj.slackUsername ?? undefined,
        admin: searchObj.admin ?? undefined,
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
   */
  item: async (root, args, context) => await getItem(args.id, context.user.admin),
  items: async (root, args, context) => {
    const items = await prisma.item.findMany({
      where: {
        hidden: context.user.admin ? undefined : false,
        location: {
          hidden: context.user.admin ? undefined : false,
        },
      },
      include: {
        location: true,
        category: true,
      },
    });

    const itemQuantities = await QuantityController.all();
    return items.map(item => populateItem(item, context.user.admin, itemQuantities));
  },
  /**
   * Bulk items API
   * TODO: pagination/returned quantity limit
   * Access level: any signed in user
   */
  allItems: async (root, args, context) => {
    const items = await prisma.item.findMany({
      where: {
        hidden: context.user.admin ? undefined : false,
      },
      include: {
        location: true,
        category: true,
      },
    });

    const locations = await prisma.location.findMany({
      where: {
        hidden: context.user.admin ? undefined : false,
      },
    });

    const itemQuantities = await QuantityController.all();
    const itemsByLocation: ItemsByLocation[] = [];

    for (const location of locations) {
      const itemsAtLocation = items.filter(predItem => predItem.locationId === location.id);
      const itemsByCategory: Record<number, ItemsByCategory> = {};

      for (const item of itemsAtLocation) {
        if (!Object.prototype.hasOwnProperty.call(itemsByCategory, item.categoryId)) {
          itemsByCategory[item.categoryId] = {
            category: item.category,
            items: [],
          };
        }

        // @ts-ignore
        itemsByCategory[item.categoryId].items.push(
          populateItem(item, context.user.admin, itemQuantities)
        );
      }

      itemsByLocation.push({
        location,
        categories: Object.values(itemsByCategory).sort((a, b) =>
          a.category.name.localeCompare(b.category.name)
        ),
      });
    }

    return itemsByLocation;
  },
  categories: async () => await prisma.category.findMany(),
  locations: async () => await prisma.location.findMany(),
  itemStatistics: async (root, args, context) => {
    if (!context.user.admin) {
      throw new GraphQLError("You do not have permission to access this endpoint");
    }

    const prismaItems = await prisma.item.findMany({
      include: {
        category: true,
        location: true,
      },
    });

    const itemQuantities = await QuantityController.all();
    const items = prismaItems.map(item => populateItem(item, context.user.admin, itemQuantities));
    const detailedQuantities = await QuantityController.getQuantities();

    return items.map(item => {
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
  request: async (root, args, context) => {
    if (!context.user.admin) {
      throw new GraphQLError("You do not have permission to access this endpoint");
    }

    if (args.id <= 0) {
      throw new GraphQLError(
        "Invalid request ID.  The request ID you provided was <= 0, but request IDs must be >= 1."
      );
    }

    const request = await prisma.request.findFirst({
      where: {
        id: args.id,
      },
      include: {
        item: {
          include: {
            location: true,
            category: true,
          },
        },
        user: true,
      },
    });

    if (request === null) {
      return null;
    }

    const itemQuantities = await QuantityController.all([request.item.id]);
    return populateRequest(request, context.user.admin, itemQuantities);
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
        return []; // return an empty array and avoid making a DB query
      }

      searchObj.userId = context.user.uuid; // otherwise, restrict their results to just their user ID
      searchObj.item = {
        location: {
          hidden: false, // don't show hidden locations
        },
        hidden: false, // don't show hidden items
      };
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

    const itemQuantities = await QuantityController.all(items);
    return requests.map(request => populateRequest(request, context.user.admin, itemQuantities));
  },
  setting: async (root, args) => await getSetting(args.name),
};
