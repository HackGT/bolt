import { RequestStatus } from "../graphql.types";
import { ItemController } from "./ItemController";
import { prisma } from "../../common";

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

export class QuantityController {
  public static async inStock(itemIds: number[] = []): Promise<ItemQtyAvailable> {
    const quantities: ItemQuantities = await QuantityController.getQuantities(
      ["SUBMITTED", "APPROVED", "READY_FOR_PICKUP", "FULFILLED", "LOST", "DAMAGED"],
      itemIds
    );
    const totalAvailable: ItemQtyAvailable = await ItemController.getTotalAvailable(itemIds);

    return this.getTotalAvailableLessStatuses(quantities, totalAvailable, [
      "FULFILLED",
      "LOST",
      "DAMAGED",
    ]);
  }

  public static async unreserved(itemIds: number[] = []): Promise<ItemQtyAvailable> {
    const quantities: ItemQuantities = await QuantityController.getQuantities(
      ["SUBMITTED", "APPROVED", "READY_FOR_PICKUP", "FULFILLED", "LOST", "DAMAGED"],
      itemIds
    );
    const totalAvailable: ItemQtyAvailable = await ItemController.getTotalAvailable(itemIds);

    return this.getTotalAvailableLessStatuses(quantities, totalAvailable, [
      "SUBMITTED",
      "APPROVED",
      "READY_FOR_PICKUP",
      "FULFILLED",
      "LOST",
      "DAMAGED",
    ]);
  }

  public static async availableForApproval(itemIds: number[] = []): Promise<ItemQtyAvailable> {
    const quantities: ItemQuantities = await QuantityController.getQuantities(
      ["SUBMITTED", "APPROVED", "READY_FOR_PICKUP", "FULFILLED", "LOST", "DAMAGED"],
      itemIds
    );
    const totalAvailable: ItemQtyAvailable = await ItemController.getTotalAvailable(itemIds);

    return this.getTotalAvailableLessStatuses(quantities, totalAvailable, [
      "APPROVED",
      "READY_FOR_PICKUP",
      "FULFILLED",
      "LOST",
      "DAMAGED",
    ]);
  }

  public static async all(itemIds: number[] = []): Promise<ItemAllQtys> {
    const quantities: ItemQuantities = await QuantityController.getQuantities(
      ["SUBMITTED", "APPROVED", "READY_FOR_PICKUP", "FULFILLED", "LOST", "DAMAGED"],
      itemIds
    );
    const totalAvailable: ItemQtyAvailable = await ItemController.getTotalAvailable(itemIds);

    const qtyInStock: ItemQtyAvailable = this.getTotalAvailableLessStatuses(
      quantities,
      totalAvailable,
      ["FULFILLED", "LOST", "DAMAGED"]
    );
    const qtyUnreserved: ItemQtyAvailable = this.getTotalAvailableLessStatuses(
      quantities,
      totalAvailable,
      ["SUBMITTED", "APPROVED", "READY_FOR_PICKUP", "FULFILLED", "LOST", "DAMAGED"]
    );
    const qtyAvailableForApproval: ItemQtyAvailable = this.getTotalAvailableLessStatuses(
      quantities,
      totalAvailable,
      ["APPROVED", "READY_FOR_PICKUP", "FULFILLED", "LOST", "DAMAGED"]
    );

    return {
      qtyInStock,
      qtyUnreserved,
      qtyAvailableForApproval,
    };
  }

  public static async quantityStatistics(): Promise<ItemQuantities> {
    return await QuantityController.getQuantities();
  }

  private static getTotalAvailableLessStatuses(
    quantities: ItemQuantities,
    totalAvailable: ItemQtyAvailable,
    statuses: RequestStatus[] = []
  ): ItemQtyAvailable {
    const result: any = {};

    for (const id in totalAvailable) {
      if (Object.prototype.hasOwnProperty.call(totalAvailable, id)) {
        if (Object.prototype.hasOwnProperty.call(quantities, id)) {
          const itemStatusCounts = quantities[id];
          let quantity = totalAvailable[id];
          for (let i = 0; i < statuses.length; i++) {
            quantity -= itemStatusCounts[statuses[i]];
          }
          result[id] = quantity;
        } else {
          // no requests for this item with statuses provided, so just return totalAvailable
          result[id] = totalAvailable[id];
        }
      }
    }

    return result;
  }

  private static async getQuantities(
    statuses: RequestStatus[] = [],
    itemIds: number[] = []
  ): Promise<ItemQuantities> {
    let selectStatuses = statuses;
    if (selectStatuses.length === 0) {
      selectStatuses = [
        "SUBMITTED",
        "APPROVED",
        "DENIED",
        "ABANDONED",
        "CANCELLED",
        "READY_FOR_PICKUP",
        "FULFILLED",
        "RETURNED",
        "LOST",
        "DAMAGED",
      ];
    }

    const quantities = await prisma.request.groupBy({
      by: ["itemId", "status"],
      sum: {
        quantity: true,
      },
      where: {
        status: {
          in: selectStatuses.length === 0 ? undefined : selectStatuses,
        },
        itemId: {
          in: itemIds.length === 0 ? undefined : itemIds,
        },
      },
    });

    const baseObj: any = {};
    for (let i = 0; i < selectStatuses.length; i++) {
      baseObj[selectStatuses[i]] = 0;
    }

    const result: any = {};
    for (let i = 0; i < quantities.length; i++) {
      const item = quantities[i];
      const requestItemId = item.itemId;

      if (!Object.prototype.hasOwnProperty.call(result, requestItemId.toString(10))) {
        result[requestItemId] = { ...baseObj }; // make a copy of baseObj
      }

      result[requestItemId][item.status] = item.sum.quantity;
      result[requestItemId].total =
        result[requestItemId][item.status] + (result[requestItemId].total || 0);
    }

    return result;
  }
}
