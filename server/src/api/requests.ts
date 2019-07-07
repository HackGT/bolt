import moment from "moment";

export type RequestStatus = "SUBMITTED"
    | "APPROVED"
    | "DENIED"
    | "ABANDONED"
    | "CANCELLED"
    | "READY_FOR_PICKUP"
    | "FULFILLED"
    | "RETURNED"
    | "LOST"
    | "DAMAGE";

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

export function nestedRequest(request: KnexRequest, isAdmin: boolean) {
    const user = {
        uuid: request.uuid,
        admin: request.admin,
        name: request.name,
        email: request.email,
        phone: request.phone,
        slackUsername: request.slackUsername,
        haveID: request.haveID
    };

    const item = {
        id: request.item_id,
        item_name: request.item_name,
        description: request.description,
        imageUrl: request.imageUrl,
        category: request.category_name,
        totalAvailable: request.totalAvailable,
        maxRequestQty: request.maxRequestQty,
        price: onlyIfAdmin(request.price, isAdmin),
        hidden: request.hidden,
        returnRequired: request.returnRequired,
        approvalRequired: request.approvalRequired,
        owner: onlyIfAdmin(request.owner, isAdmin)
    };


    return {
        user,
        item,
        request_id: request.request_id,
        status: request.status,
        quantity: request.quantity,
        createdAt: localTimestamp(request.created_at),
        updatedAt: localTimestamp(request.updated_at)
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
