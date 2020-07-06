import {RequestStatus} from "../graphql.types";
import {DB} from "../../database";
import {ItemController} from "../items/ItemController";

interface QuantitiesInStatus {
    [statusName: string]: number;
}

interface ItemQuantities {
    [itemId: string]: QuantitiesInStatus;
}

export interface ItemQtyAvailable {
    [itemId: string]: number;
}

export interface ItemAllQtys {
    qtyInStock: ItemQtyAvailable;
    qtyUnreserved: ItemQtyAvailable;
    qtyAvailableForApproval: ItemQtyAvailable;
}

export class Quantity {
    public static async inStock(itemIds: number[] = []): Promise<ItemQtyAvailable> {
        const quantities: ItemQuantities = await Quantity.getQuantities(["SUBMITTED", "APPROVED", "READY_FOR_PICKUP", "FULFILLED", "LOST", "DAMAGED"], itemIds);
        const totalAvailable: ItemQtyAvailable = await ItemController.getTotalAvailable(itemIds);

        return this.getTotalAvailableLessStatuses(quantities, totalAvailable, ["FULFILLED", "LOST", "DAMAGED"]);
    }

    public static async unreserved(itemIds: number[] = []): Promise<ItemQtyAvailable> {
        const quantities: ItemQuantities = await Quantity.getQuantities(["SUBMITTED", "APPROVED", "READY_FOR_PICKUP", "FULFILLED", "LOST", "DAMAGED"], itemIds);
        const totalAvailable: ItemQtyAvailable = await ItemController.getTotalAvailable(itemIds);

        return this.getTotalAvailableLessStatuses(quantities, totalAvailable, ["SUBMITTED", "APPROVED", "READY_FOR_PICKUP", "FULFILLED", "LOST", "DAMAGED"]);
    }

    public static async availableForApproval(itemIds: number[] = []): Promise<ItemQtyAvailable> {
        const quantities: ItemQuantities = await Quantity.getQuantities(["SUBMITTED", "APPROVED", "READY_FOR_PICKUP", "FULFILLED", "LOST", "DAMAGED"], itemIds);
        const totalAvailable: ItemQtyAvailable = await ItemController.getTotalAvailable(itemIds);

        return this.getTotalAvailableLessStatuses(quantities, totalAvailable, ["APPROVED", "READY_FOR_PICKUP", "FULFILLED", "LOST", "DAMAGED"]);
    }

    public static async all(itemIds: number[] = []): Promise<ItemAllQtys> {
        const quantities: ItemQuantities = await Quantity.getQuantities(["SUBMITTED", "APPROVED", "READY_FOR_PICKUP", "FULFILLED", "LOST", "DAMAGED"], itemIds);
        const totalAvailable: ItemQtyAvailable = await ItemController.getTotalAvailable(itemIds);

        const qtyInStock: ItemQtyAvailable = this.getTotalAvailableLessStatuses(quantities, totalAvailable, ["FULFILLED", "LOST", "DAMAGED"]);
        const qtyUnreserved: ItemQtyAvailable = this.getTotalAvailableLessStatuses(quantities, totalAvailable, ["SUBMITTED", "APPROVED", "READY_FOR_PICKUP", "FULFILLED", "LOST", "DAMAGED"]);
        const qtyAvailableForApproval: ItemQtyAvailable = this.getTotalAvailableLessStatuses(quantities, totalAvailable, ["APPROVED", "READY_FOR_PICKUP", "FULFILLED", "LOST", "DAMAGED"]);

        return {
            qtyInStock,
            qtyUnreserved,
            qtyAvailableForApproval
        };
    }

    public static async quantityStatistics(itemIds: number[] = []): Promise<ItemQuantities> {
        return await Quantity.getQuantities();
    }

    private static getTotalAvailableLessStatuses(quantities: ItemQuantities, totalAvailable: ItemQtyAvailable, statuses: RequestStatus[] = []): ItemQtyAvailable {
        const result = {};

        for (const id in totalAvailable) {
            if (totalAvailable.hasOwnProperty(id)) {
                if (quantities.hasOwnProperty(id)) {
                    const itemStatusCounts = quantities[id];
                    let quantity = totalAvailable[id];
                    for (let i = 0; i < statuses.length; i++) {
                        quantity -= itemStatusCounts[statuses[i]];
                    }
                    result[id] = quantity;
                } else { // no requests for this item with statuses provided, so just return totalAvailable
                    result[id] = totalAvailable[id];
                }
            }
        }

        return result;
    }

    private static async getQuantities(statuses: RequestStatus[] = [], itemIds: number[] = []): Promise<ItemQuantities> {
        if (!statuses.length) {
            statuses = ["SUBMITTED",
                "APPROVED",
                "DENIED",
                "ABANDONED",
                "CANCELLED",
                "READY_FOR_PICKUP",
                "FULFILLED",
                "RETURNED",
                "LOST",
                "DAMAGED"];
        }

        const DBQuantities: any = await DB.from("requests")
            .where((builder) => {
                    const whereInStatus = builder.whereIn("status", statuses);
                    if (itemIds.length > 0) {
                        return whereInStatus.whereIn("request_item_id", itemIds);
                    }

                    return whereInStatus;
                }
            )
            .groupBy(["request_item_id", "status"])
            .select(["request_item_id", "status"])
            .sum("quantity");

        const baseObj = {};
        for (let i = 0; i < statuses.length; i++) {
            baseObj[statuses[i]] = 0;
        }

        const result = {};
        for (let i = 0; i < DBQuantities.length; i++) {
            const item = DBQuantities[i];
            const requestItemId = item.request_item_id;

            if (!result.hasOwnProperty(requestItemId.toString(10))) {
                result[requestItemId] = Object.assign({}, baseObj); // make a copy of baseObj
            }

            result[requestItemId][item.status] = Number.parseInt(item.sum, 10);
            result[requestItemId].total = result[requestItemId][item.status] + (result[requestItemId].total || 0);
        }

        return result;
    }
}
