import React from 'react';
import {HwItem} from "../../types/Hardware";
import HardwareItem from "./HardwareItem";
import {Item} from "semantic-ui-react";

const HardwareCategory = ({name, items, requestsEnabled}: any) => {

    return (
        <div>
            <Item.Group>
                {items
                // @ts-ignore
                    .sort((a: any, b: any) => (b.qtyUnreserved > 0) - (a.qtyUnreserved > 0)
                        || a.item_name.localeCompare(b.item_name))
                    .map((item: HwItem) => <HardwareItem key={item.id}
                                                         item={item}
                                                         requestsEnabled={requestsEnabled}
                                                         user={null}

                />)}
            </Item.Group>
        </div>
    );
};

export default HardwareCategory;