import {DB} from "../../database";
import {Quantity} from "../requests/quantity";
import {onlyIfAdmin} from "../requests";
import {Item} from "../graphql.types";

export class ItemController {
    public static async getTotalAvailable(itemIds: number[] = []) {
        const result = await DB.from("items")
            .where((builder) => {
                if (itemIds.length) {
                    builder.whereIn("item_id", itemIds);
                }
            })
            .select(["item_id", "totalAvailable"]);

        if (!result.length) {
            return {};
        }

        const resultObj = {};

        for (let i = 0; i < result.length; i++) {
            const item = result[i];
            resultObj[item.item_id] = item.totalAvailable;
        }

        return resultObj;
    }

    public static async get(searchObj: any, isAdmin: boolean): Promise<Item[]> {
        const items = await DB.from("items")
            .where(searchObj)
            .join("categories", "items.category_id", "=", "categories.category_id")
            .join("locations", "locations.location_id", "=", "items.location_id");

        const {qtyInStock, qtyUnreserved, qtyAvailableForApproval} = await Quantity.all();

        return items.map(item => {
            return {
                ...item,
                id: item.item_id,
                category: item.category_name,
                location: getItemLocation(item),
                price: onlyIfAdmin(item.price, isAdmin),
                owner: onlyIfAdmin(item.owner, isAdmin),
                qtyInStock: qtyInStock[item.item_id],
                qtyUnreserved: qtyUnreserved[item.item_id],
                qtyAvailableForApproval: qtyAvailableForApproval[item.item_id],
            };
        });
    }
}

export function getItemLocation(item: any) {
    return {
        location_id: item.location_id,
        location_name: item.location_name,
        location_hidden: item.location_hidden
    };
}
