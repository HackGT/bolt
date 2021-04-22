/* eslint-disable camelcase */
import { Category, Item, Request, User, Location } from "@prisma/client";

import { Request as GraphQLRequest } from "../graphql.types";
import { localTimestamp, onlyIfAdmin } from "../util";
import { QuantityController } from "./QuantityController";

type DetailedRequest = Request & {
  user: User;
  item: Item & {
    category: Category;
    location: Location;
  };
};

export class RequestController {
  public static async toNestedRequest(
    request: DetailedRequest,
    isAdmin: boolean,
    items: number[]
  ): Promise<GraphQLRequest> {
    const { qtyInStock, qtyUnreserved, qtyAvailableForApproval } = await QuantityController.all(
      items
    );

    return {
      ...request,
      item: {
        ...request.item,
        price: onlyIfAdmin(request.item.price, isAdmin),
        owner: onlyIfAdmin(request.item.owner, isAdmin),
        qtyInStock: qtyInStock[request.itemId],
        qtyAvailableForApproval: qtyAvailableForApproval[request.itemId],
        qtyUnreserved: qtyUnreserved[request.itemId],
      },
      createdAt: localTimestamp(request.createdAt),
      updatedAt: localTimestamp(request.updatedAt),
    };
  }

  public static toSimpleRequest(request: Request) {
    return {
      id: request.id,
      status: request.status,
      quantity: request.quantity,
      createdAt: localTimestamp(request.createdAt),
      updatedAt: localTimestamp(request.updatedAt),
    };
  }
}
