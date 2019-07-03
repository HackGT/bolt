import {RequestStatus} from "./api.graphql";

export interface KnexRequest {
    request_id: number;
    status: RequestStatus;
    quantity: number;
    created_at: string;
    updated_at: string;
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

export function nestedRequest(request: KnexRequest) {
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
        price: request.price, // TODO: should not be accessible to non-admins
        hidden: request.hidden,
        returnRequired: request.returnRequired,
        approvalRequired: request.approvalRequired,
        owner: request.owner // TODO: should not be accessible to non-admins
    };

    return {
        user,
        item,
        status: request.status,
        quantity: request.quantity,
        createdAt: request.created_at.toLocaleString(),
        updatedAt: request.updated_at.toLocaleString()
    };
}
