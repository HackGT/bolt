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
};

export type Category = {
    category_id: number,
    category_name: string
}

export type ItemByCat = {
    category: Category,
    items: HwItem[];
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

export const SUBMITTED = "SUBMITTED";
export const APPROVED = "APPROVED";
export const DENIED = "DENIED";
export const CANCELLED = "CANCELLED";
export const READY_FOR_PICKUP = "READY_FOR_PICKUP";
export const FULFILLED = "FULFILLED";
export const RETURNED = "RETURNED";
export const LOST = "LOST";
export const DAMAGED = "DAMAGED";

export interface HwListItem extends ItemCore {
    id: number;
    qtyUnreserved: number; // # of this item remaining in our stock
    inStock: boolean;
    requestsEnabled: boolean; // whether hardware requests can be made at this time
    toastManager: any; // for making toast notifications
    addItem: (item: RequestedItem) => void;
    qtyUpdate: RequestedItem | null;
    user: User | null;
}
