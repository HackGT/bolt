import { QuantityController } from "./QuantityController";
import { onlyIfAdmin } from "../util";
import { Item } from "../graphql.types";
import { prisma } from "../../common";

export class ItemController {
  public static async getTotalAvailable(itemIds: number[] = []) {
    const items = await prisma.item.findMany({
      where: {
        id: {
          in: itemIds.length === 0 ? undefined : itemIds,
        },
      },
    });
    const resultObj: { [id: number]: number } = {};

    for (const item of items) {
      resultObj[item.id] = item.totalAvailable;
    }

    return resultObj;
  }

  public static async get(searchObj: any, isAdmin: boolean): Promise<Item[]> {
    const items = await prisma.item.findMany({
      where: searchObj,
      include: {
        category: true,
        location: true,
      },
    });

    const { qtyInStock, qtyUnreserved, qtyAvailableForApproval } = await QuantityController.all();

    return items.map(item => ({
      ...item,
      price: onlyIfAdmin(item.price, isAdmin),
      owner: onlyIfAdmin(item.owner, isAdmin),
      qtyInStock: qtyInStock[item.id],
      qtyUnreserved: qtyUnreserved[item.id],
      qtyAvailableForApproval: qtyAvailableForApproval[item.id],
    }));
  }
}
