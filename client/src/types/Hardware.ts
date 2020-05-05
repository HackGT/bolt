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
	qtyInStock: number;
	qtyAvailableForApproval: number;
	location: Location;
};

export type Category = {
	category_id: number
	category_name: string
}

export type Location = {
	location_id: number
	location_name: string
	location_hidden: boolean
}

export type ItemByLocation = {
	location: Location
	categories: ItemByCat[]
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
	location: Location;
	status: ItemStatus;
	cancelled: boolean;
}

export enum ItemStatus {
	SUBMITTED = "submitted",
	APPROVED = "approved",
	DECLINED = "declined",
	ABANDONED = "abandoned",
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
export const ABANDONED = "ABANDONED";
export const CANCELLED = "CANCELLED";
export const READY_FOR_PICKUP = "READY_FOR_PICKUP";
export const FULFILLED = "FULFILLED";
export const RETURNED = "RETURNED";
export const LOST = "LOST";
export const DAMAGED = "DAMAGED";

export type DetailedItemQuantities = {
    SUBMITTED: number,
    APPROVED: number,
    DENIED: number,
    ABANDONED: number,
    CANCELLED: number,
    READY_FOR_PICKUP: number,
    FULFILLED: number,
    RETURNED: number,
    LOST: number,
    DAMAGED: number
    total: number
}

export type ItemWithStatistics = {
    item: HwItem,
    detailedQuantities: DetailedItemQuantities
}
