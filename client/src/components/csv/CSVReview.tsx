import React from "react";
import {Container, Item, Label} from "semantic-ui-react";
import {ItemComplete} from "../item/ItemEditForm";

interface ReviewCardProps {
    item: ItemComplete;
}

interface ReviewProps {
    inventory: ItemComplete[];
}

const ReviewSetup = (props: ReviewProps) => {
    const { inventory } = props;

    return (
        <Container>
            <Item.Group>
                {inventory.map(item => <ReviewCard key={item.name} item={item}/>)}
            </Item.Group>
        </Container>
    );
};

const ReviewCard = (props: ReviewCardProps) => {
    const { item } = props;
    const {
        name, description, totalAvailable, maxRequestQty,
            imageUrl, category, price, owner, 
            requireApproval, returnRequired, hidden} = item;
    return (
        <Item>
            <Item.Image size="tiny" src={imageUrl}/>
            <Item.Content>
                <Item.Header as="h4">{name}</Item.Header>
                <Item.Meta>Request up to {maxRequestQty} at a time | {totalAvailable} available, Owner: {owner}, Unit
                    Cost: ${price}</Item.Meta>
                <Item.Meta>
                    <Label>{category}</Label>
                    {hidden ? <Label tag color="red">Hidden</Label> : null}
                    {!requireApproval ? <Label tag color="red">No Approval Required</Label> : null}
                    {!returnRequired ? <Label tag color="red">No Return Required</Label> : null}
                </Item.Meta>
                <Item.Description>{description}</Item.Description>
            </Item.Content>
        </Item>
    );
};

export default ReviewSetup;
