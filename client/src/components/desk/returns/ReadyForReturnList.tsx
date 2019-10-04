import React from 'react';
import {Container, Header, Segment} from "semantic-ui-react";
import CardList from "../CardList";
import ReadyForReturnCard from "./ReadyForReturnCard";

function ReadyForReturnList({cards}: any) {
    const empty = (<Segment placeholder>
        <Container textAlign="center">
            <Header>
                No requests eligible for return. Take a break!
            </Header>
        </Container>
    </Segment>);

    return (
        <CardList title="Ready for Return" length={cards.length}>
            {cards.sort((a: any, b: any) => a.user.name.localeCompare(b.user.name)).map((card: any) =>
                <ReadyForReturnCard key={card.user.uuid} card={card}/>)}
            {!cards.length ? empty : ""}
        </CardList>
    );
}

export default ReadyForReturnList;
