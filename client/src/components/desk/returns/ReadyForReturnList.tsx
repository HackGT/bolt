import React from 'react';
import {Container, Grid, Header, Segment} from "semantic-ui-react";
import CardList from "../CardList";
import ReadyForReturnCard from "./ReadyForReturnCard";
import {requestSearch} from "../DeskUtil";

function ReadyForReturnList({cards}: { cards: any }) {
    const empty = (<Segment placeholder>
        <Container textAlign="center">
            <Header>
                No requests eligible for return. Take a break!
            </Header>
        </Container>
    </Segment>);


    const allCards = cards.sort((a: any, b: any) => a.user.name.localeCompare(b.user.name));

    return (
        <Grid>
            <Grid.Row columns={3}>
                <Grid.Column>
                    <CardList title="Ready for Return" length={allCards.length}
                              cards={cards}
                              render={(card: any) =>
                                  <ReadyForReturnCard key={card.user.uuid} card={card}/>}
                              filter={requestSearch}
                              empty={empty}
                    />
                </Grid.Column>
            </Grid.Row>
        </Grid>
    );
}

export default ReadyForReturnList;
