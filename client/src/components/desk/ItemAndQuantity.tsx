import React from 'react';
import {Label} from "semantic-ui-react";

interface Props {
    quantity: number;
    itemName: string;
}

function ItemAndQuantity({quantity, itemName, ...props}: Props) {
    return <>
        <Label pointing="right" color="blue" className="hw-qty">
            {quantity}x
        </Label>
        {itemName}
    </>;
}

export default ItemAndQuantity;
