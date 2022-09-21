import React from "react";
import { Container, Item as SMItem, Label } from "semantic-ui-react";

import { Item } from "../../../types/Hardware";

interface ReviewCardProps {
  item: Item;
}

const ReviewCard = (props: ReviewCardProps) => {
  const { item } = props;
  const {
    name,
    description,
    totalAvailable,
    maxRequestQty,
    imageUrl,
    category,
    price,
    owner,
    approvalRequired,
    returnRequired,
    hidden,
    location,
  } = item;
  return (
    <SMItem>
      <SMItem.Image size="tiny" src={imageUrl} />
      <SMItem.Content>
        <SMItem.Header as="h4">{name}</SMItem.Header>
        <SMItem.Meta>
          {`Request up to ${maxRequestQty} at a time | ${totalAvailable} available, Location: ${location}
          , Owner: ${owner}, Unit Cost: ${price}`}
        </SMItem.Meta>
        <SMItem.Meta>
          <Label>{`Category: ${category}`}</Label>
          {hidden ? (
            <Label tag color="red">
              Hidden
            </Label>
          ) : null}
          {!approvalRequired ? (
            <Label tag color="red">
              No Approval Required
            </Label>
          ) : null}
          {!returnRequired ? (
            <Label tag color="red">
              No Return Required
            </Label>
          ) : null}
        </SMItem.Meta>
        <SMItem.Description>{description}</SMItem.Description>
      </SMItem.Content>
    </SMItem>
  );
};

interface ReviewSetupProps {
  inventory: Item[];
}

const ReviewSetup = (props: ReviewSetupProps) => {
  const { inventory } = props;

  return (
    <Container>
      <SMItem.Group>
        {inventory.map(item => (
          <ReviewCard key={item.name} item={item} />
        ))}
      </SMItem.Group>
    </Container>
  );
};

export default ReviewSetup;
