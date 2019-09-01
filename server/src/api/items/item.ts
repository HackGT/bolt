import {DB} from "../../database";

export class Item {
    public static async getTotalAvailable(itemId: number = -1) {
        const searchObj: { item_id?: number } = {};
        if (itemId !== -1) {
            searchObj.item_id = itemId;
        }
        const result = await DB.from("items")
            .where(searchObj)
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
