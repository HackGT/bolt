import {User} from "./User";

export type HwItem = {
    id: number;
    item_name: string;
    description: string;
    imageUrl: string;
    category: string;
    totalAvailable: number;
    maxRequestQty: number;
    price: number;
    hidden: boolean;
    returnRequired: boolean;
    approvalRequired: boolean;
    owner: string;
    qtyUnreserved: number;
    qtyInstock: number;
};

export interface ItemCore {
    item_name: string;
    description: string;
    totalAvailable: number;
    maxRequestQty: number;
    category: string;
    imageUrl: string;
}

export interface ItemNoId {
    item_name: string; // name of this item
    description: string; // brief description
    totalAvailable: number;
    maxRequestQty: number; // max number of a specific item you can request at once
    category: string;
    imageUrl: string;
}

export interface RequestedItem {
    id: number;
    user: string;
    name: string;
    qtyRequested: number;
    category: string;
    status: ItemStatus;
    cancelled: boolean;
}

export enum ItemStatus {
    SUBMITTED = "submitted",
    APPROVED = "approved",
    DECLINED = "declined",
    CANCELLED = "cancelled",
    READY = "ready",
    FULFILLED = "fulfilled",
    RETURNED = "returned",
    LOST = "lost",
    DAMAGED = "damaged"
}

export interface HwListItem extends ItemCore {
    id: number;
    qtyRemaining: number; // # of this item remaining in our stock
    inStock: boolean;
    requestsEnabled: boolean; // whether hardware requests can be made at this time
    toastManager: any; // for making toast notifications
    addItem: (item: RequestedItem) => void;
    qtyUpdate: RequestedItem | null;
    user: User | null;
}
