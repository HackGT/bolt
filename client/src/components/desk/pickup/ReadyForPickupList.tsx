import React from 'react';
import {Container, Header, Segment} from "semantic-ui-react";
import CardList from "../CardList";
import ReadyForPickupCard from "./ReadyForPickupCard";

function ReadyForPickupList({cards}: any) {
    const empty = (<Segment placeholder>
        <Container textAlign="center">
            <Header>
                No requests awaiting pickup. Take a break!
            </Header>
        </Container>
    </Segment>);

    return (
        <CardList title="Ready for Pickup" length={cards.length}>
            {cards.map((card: any) => <ReadyForPickupCard key={card.user.uuid} card={card}/>)}
            {!cards.length ? empty : ""}
        </CardList>
    );
}

export default ReadyForPickupList;
