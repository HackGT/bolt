import {RequestStatus} from "../graphql.types";
import {DB} from "../../database";
import {Item} from "../items/item";

interface QuantitiesInStatus {
    [statusName: string]: number;
}

interface ItemQuantities {
    [itemId: string]: QuantitiesInStatus;
}

interface ItemQtyAvailable {
    [itemId: string]: number;
}

export class Quantity {
    public static async inStock(itemId: number = -1) {
        const quantities: ItemQuantities = await Quantity.getQuantities(["SUBMITTED", "APPROVED", "READY_FOR_PICKUP", "FULFILLED", "LOST", "DAMAGED"], itemId);
        const totalAvailable: ItemQtyAvailable = await Item.getTotalAvailable(itemId);

        return this.getTotalAvailableLessStatuses(quantities, totalAvailable, ["FULFILLED", "LOST", "DAMAGED"], itemId);
    }

    public static async unreserved(itemId: number = -1) {
        const quantities: ItemQuantities = await Quantity.getQuantities(["SUBMITTED", "APPROVED", "READY_FOR_PICKUP", "FULFILLED", "LOST", "DAMAGED"], itemId);
        const totalAvailable: ItemQtyAvailable = await Item.getTotalAvailable(itemId);

        return this.getTotalAvailableLessStatuses(quantities, totalAvailable, ["SUBMITTED", "APPROVED", "READY_FOR_PICKUP", "FULFILLED", "LOST", "DAMAGED"]);
    }

    public static async availableForApproval(itemId: number = -1) {
        const quantities: ItemQuantities = await Quantity.getQuantities(["SUBMITTED", "APPROVED", "READY_FOR_PICKUP", "FULFILLED", "LOST", "DAMAGED"], itemId);
        const totalAvailable: ItemQtyAvailable = await Item.getTotalAvailable(itemId);

        return this.getTotalAvailableLessStatuses(quantities, totalAvailable, ["APPROVED", "READY_FOR_PICKUP", "FULFILLED", "LOST", "DAMAGED"]);
    }

    public static async all(itemId: number = -1) {
        const quantities: ItemQuantities = await Quantity.getQuantities(["SUBMITTED", "APPROVED", "READY_FOR_PICKUP", "FULFILLED", "LOST", "DAMAGED"], itemId);
        const totalAvailable: ItemQtyAvailable = await Item.getTotalAvailable(itemId);

        const qtyInStock: ItemQtyAvailable = this.getTotalAvailableLessStatuses(quantities, totalAvailable, ["FULFILLED", "LOST", "DAMAGED"], itemId);
        const qtyUnreserved: ItemQtyAvailable = this.getTotalAvailableLessStatuses(quantities, totalAvailable, ["SUBMITTED", "APPROVED", "READY_FOR_PICKUP", "FULFILLED", "LOST", "DAMAGED"]);
        const qtyAvailableForApproval: ItemQtyAvailable = this.getTotalAvailableLessStatuses(quantities, totalAvailable, ["APPROVED", "READY_FOR_PICKUP", "FULFILLED", "LOST", "DAMAGED"]);

        return {
            qtyInStock,
            qtyUnreserved,
            qtyAvailableForApproval
        };
    }

    private static getTotalAvailableLessStatuses(quantities: ItemQuantities, totalAvailable: ItemQtyAvailable, statuses: RequestStatus[] = [], itemId: number = -1): ItemQtyAvailable {
        const result = {};

        for (const id in totalAvailable) {
            if (totalAvailable.hasOwnProperty(id)) {
                if (quantities.hasOwnProperty(id)) {
                    const item = quantities[id];
                    let quantity: number = totalAvailable[id];
                    for (let i = 0; i < statuses.length; i++) {
                        quantity -= item[statuses[i]];
                    }
                    result[id] = quantity;
                } else { // no requests for this item with statuses provided, so just return totalAvailable
                    result[id] = totalAvailable[id];
                }
            }
        }

        return result;
    }

    private static async getQuantities(statuses: RequestStatus[] = [], itemId: number = -1): Promise<ItemQuantities> {
        const searchObj: { request_item_id?: number } = {};
        if (itemId !== -1) {
            searchObj.request_item_id = itemId;
        }

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

        const DBQuantities = await DB.from("requests")
            .whereIn("status", statuses)
            .andWhere(searchObj)
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
        }

        return result;
    }
}
