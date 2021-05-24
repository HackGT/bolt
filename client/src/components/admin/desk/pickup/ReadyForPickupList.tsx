import React from "react";
import { Container, Header, Segment } from "semantic-ui-react";

import CardList from "../CardList";
import ReadyForPickupCard from "./ReadyForPickupCard";
import { requestSearch } from "../DeskUtil";

function ReadyForPickupList({ cards }: any) {
  const empty = (
    <Segment placeholder>
      <Container textAlign="center">
        <Header>No requests awaiting pickup. Take a break!</Header>
      </Container>
    </Segment>
  );

  return (
    <CardList
      title="Ready for Pickup"
      length={cards.length}
      filter={requestSearch}
      cards={cards}
      render={(card: any) => <ReadyForPickupCard key={card.user.uuid} card={card} />}
      empty={empty}
    />
  );
}

export default ReadyForPickupList;
