import React from "react";
import { Item as SMItem } from "semantic-ui-react";

import { Item } from "../../types/Hardware";
import HardwareItem from "./HardwareItem";

const HardwareCategory = ({ name, items, requestsEnabled }: any) => (
  <div>
    <SMItem.Group>
      {items
        .sort(
          (a: any, b: any) =>
            // @ts-ignore
            (b.qtyUnreserved > 0) - (a.qtyUnreserved > 0) || a.name.localeCompare(b.name)
        )
        .map((item: Item) => (
          <HardwareItem
            key={item.id}
            item={item}
            requestsEnabled={requestsEnabled}
            outOfStock={item.totalAvailable <= 0}
          />
        ))}
    </SMItem.Group>
  </div>
);

export default HardwareCategory;
