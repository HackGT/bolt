import React from 'react';
import {Container, Header, Segment} from "semantic-ui-react";
import CardList from "../CardList";
import ReadyToPrepareCard from "./ReadyToPrepareCard";

function ReadyToPrepareList({cards}: any) {
    const empty = <Segment placeholder>
        <Container textAlign="center">
            <Header>
                Nothing to prepare. Take a break!
            </Header>
        </Container>
    </Segment>;

    return (
        <CardList title="Ready to Prepare" length={cards.length}>
            {cards.map((card: any) => <ReadyToPrepareCard key={card.user.uuid} card={card}/>)}
            {!cards.length ? empty : ""}
        </CardList>
    );
}

export default ReadyToPrepareList;
