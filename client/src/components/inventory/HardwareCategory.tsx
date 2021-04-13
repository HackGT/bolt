import React from "react";
import { Item } from "semantic-ui-react";

import { HwItem } from "../../types/Hardware";
import HardwareItem from "./HardwareItem";

const HardwareCategory = ({ name, items, requestsEnabled }: any) => (
  <div>
    <Item.Group>
      {items
        .sort(
          (a: any, b: any) =>
            // @ts-ignore
            (b.qtyUnreserved > 0) - (a.qtyUnreserved > 0) || a.item_name.localeCompare(b.item_name)
        )
        .map((item: HwItem) => (
          <HardwareItem key={item.id} item={item} requestsEnabled={requestsEnabled} user={null} />
        ))}
    </Item.Group>
  </div>
);

export default HardwareCategory;
