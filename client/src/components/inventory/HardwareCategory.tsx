import React from 'react';
import {HwItem} from "../../types/Hardware";
import HardwareItem from "./HardwareItem";
import {Item} from "semantic-ui-react";

const HardwareCategory = ({name, items}: any) => {
    return (
        <div>
            <Item.Group>
                {items.map((item: HwItem) => <HardwareItem key={item.id}
                                                           item={item}
                                                           requestsEnabled={true}
                                                           user={null}

                />)}
            </Item.Group>
        </div>
    );
};

export default HardwareCategory;
