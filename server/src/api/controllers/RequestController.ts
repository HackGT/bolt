/* eslint-disable camelcase */
import { RequestStatus } from "../graphql.types";
import { localTimestamp, onlyIfAdmin } from "../util";
import { ItemQtyAvailable } from "./QuantityController";

export interface KnexSimpleRequest {
  request_id: number;
  status: RequestStatus;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface KnexRequest extends KnexSimpleRequest {
  item_id: number;
  item_name: string;
  description: string;
  imageUrl: string;
  category_id: number;
  category_name: string;
  totalAvailable: number;
  maxRequestQty: number;
  price: number;
  hidden: boolean;
  returnRequired: boolean;
  approvalRequired: boolean;
  owner: string;
  uuid: string;
  admin: boolean;
  name: string;
  email: string;
  phone: string;
  slackUsername: string;
  haveID: boolean;
  qtyInStock: number;
  qtyUnreserved: number;
  qtyAvailableForApproval: number;
  location_id: number;
  location_name: string;
  location_hidden: boolean;
}

export class RequestController {
  public static toNestedRequest(
    request: KnexRequest,
    isAdmin: boolean,
    qtyInStock: ItemQtyAvailable,
    qtyAvailableForApproval: ItemQtyAvailable,
    qtyUnreserved: ItemQtyAvailable
  ) {
    return {
      user: {
        uuid: request.uuid,
        admin: request.admin,
        name: request.name,
        email: request.email,
        phone: request.phone,
        slackUsername: request.slackUsername,
        haveID: request.haveID,
      },
      item: {
        id: request.item_id,
        item_name: request.item_name,
        description: request.description,
        imageUrl: request.imageUrl,
        category: request.category_name,
        location: {
          location_id: request.location_id,
          location_name: request.location_name,
          location_hidden: request.location_hidden,
        },
        totalAvailable: request.totalAvailable,
        maxRequestQty: request.maxRequestQty,
        price: onlyIfAdmin(request.price, isAdmin),
        hidden: request.hidden,
        returnRequired: request.returnRequired,
        approvalRequired: request.approvalRequired,
        owner: onlyIfAdmin(request.owner, isAdmin),
        qtyInStock: qtyInStock[request.item_id],
        qtyAvailableForApproval: qtyAvailableForApproval[request.item_id],
        qtyUnreserved: qtyUnreserved[request.item_id],
      },
      request_id: request.request_id,
      status: request.status,
      location: {
        location_id: request.location_id,
        location_name: request.location_name,
        location_hidden: request.location_hidden,
      },
      quantity: request.quantity,
      createdAt: localTimestamp(request.created_at),
      updatedAt: localTimestamp(request.updated_at),
    };
  }

  public static toSimpleRequest(request: KnexSimpleRequest) {
    return {
      request_id: request.request_id,
      status: request.status,
      quantity: request.quantity,
      createdAt: localTimestamp(request.created_at),
      updatedAt: localTimestamp(request.updated_at),
    };
  }
}
