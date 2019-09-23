import {DB} from "../../database";

export class Item {
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
}
