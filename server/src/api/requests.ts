import moment from "moment";
import {RequestStatus} from "./graphql.types";
import {ItemQtyAvailable} from "./requests/quantity";

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
}


export function localTimestamp(createdAt: string): string {
    return moment(createdAt).toISOString(true);
}

/**
 * Return null if user is not an admin
 * @param val
 * @param isAdmin
 */
export function onlyIfAdmin(val: any, isAdmin: boolean) {
    return (isAdmin) ? val : null;
}

export function nestedRequest(request: KnexRequest, isAdmin: boolean, qtyInStock: ItemQtyAvailable, qtyAvailableForApproval: ItemQtyAvailable, qtyUnreserved: ItemQtyAvailable) {
    const user = {
        uuid: request.uuid,
        admin: request.admin,
        name: request.name,
        email: request.email,
        phone: request.phone,
        slackUsername: request.slackUsername,
        haveID: request.haveID
    };

    return {
        user,
        item: redactedItem(request, isAdmin, qtyInStock, qtyAvailableForApproval, qtyUnreserved),
        request_id: request.request_id,
        status: request.status,
        location: redactedItem(request, isAdmin, qtyInStock, qtyAvailableForApproval, qtyUnreserved).location,
        quantity: request.quantity,
        createdAt: localTimestamp(request.created_at),
        updatedAt: localTimestamp(request.updated_at)
    };
}

export function redactedItem(item: any, isAdmin: boolean, qtyInStock: ItemQtyAvailable, qtyAvailableForApproval: ItemQtyAvailable, qtyUnreserved: ItemQtyAvailable) {
    return {
        id: item.item_id,
        item_name: item.item_name,
        description: item.description,
        imageUrl: item.imageUrl,
        category: item.category_name,
        location: {
            location_id: item.location_id,
            location_name: item.location_name,
            location_hidden: item.location_hidden
        },
        totalAvailable: item.totalAvailable,
        maxRequestQty: item.maxRequestQty,
        price: onlyIfAdmin(item.price, isAdmin),
        hidden: item.hidden,
        returnRequired: item.returnRequired,
        approvalRequired: item.approvalRequired,
        owner: onlyIfAdmin(item.owner, isAdmin),
        qtyInStock: qtyInStock[item.item_id],
        qtyAvailableForApproval: qtyAvailableForApproval[item.item_id],
        qtyUnreserved: qtyUnreserved[item.item_id]
    };
}

export function toSimpleRequest(request: KnexSimpleRequest) {
    return {
        request_id: request.request_id,
        status: request.status,
        quantity: request.quantity,
        createdAt: localTimestamp(request.created_at),
        updatedAt: localTimestamp(request.updated_at)
    };
}
