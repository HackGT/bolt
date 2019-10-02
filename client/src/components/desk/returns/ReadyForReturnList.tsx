import React from 'react';
import {Container, Header, Segment} from "semantic-ui-react";
import CardList from "../CardList";

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
            {cards.map((card: any) => <p>{card.user.name}</p>)}
            {!cards.length ? empty : ""}
        </CardList>
    );
}

export default ReadyForReturnList;
