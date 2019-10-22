import React from 'react';
import {HwItem} from "../../types/Hardware";
import HardwareItem from "./HardwareItem";
import {Item} from "semantic-ui-react";

const HardwareCategory = ({name, items}: any) => {

    return (
        <div>
            <Item.Group>
                {items
                // @ts-ignore
                    .sort((a: any, b: any) => (b.qtyUnreserved > 0) - (a.qtyUnreserved > 0)
                        || b.item_name - a.item_name)
                    .map((item: HwItem) => <HardwareItem key={item.id}
                                                           item={item}
                                                           requestsEnabled={true}
                                                           user={null}

                />)}
            </Item.Group>
        </div>
    );
};

export default HardwareCategory;
