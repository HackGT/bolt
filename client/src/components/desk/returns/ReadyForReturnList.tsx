import React, {useState} from 'react';
import {Container, Grid, Header, Input, Segment} from "semantic-ui-react";
import CardList from "../CardList";
import ReadyForReturnCard from "./ReadyForReturnCard";
import {Request} from "../../../types/Request";

function ReadyForReturnList({cards}: { cards: any }) {
    const empty = (<Segment placeholder>
        <Container textAlign="center">
            <Header>
                No requests eligible for return. Take a break!
            </Header>
        </Container>
    </Segment>);

    let [searchQuery, setSearchQuery] = useState("");

    // FIXME type is wrong { user, requests } it's a card
    const filteredCards = cards.filter((r: Request) => {
        console.log(r);
        return r.user.name.indexOf(searchQuery) >= 0;
    });

    return (
        <Grid>
            <Grid.Row columns={3}>
                <Grid.Column>
                    <Input type="text"
                           label="Search users"
                           name="searchQuery"
                           onChange={(e, {value}) => {
                               setSearchQuery(value.trim().toLowerCase());
                           }}
                    />
                    <CardList title="Ready for Return" length={filteredCards.length}>
                        {filteredCards.sort((a: any, b: any) => a.user.name.localeCompare(b.user.name)).map((card: any) =>
                            <ReadyForReturnCard key={card.user.uuid} card={card}/>)}
                        {!cards.length ? empty : ""}
                    </CardList>
                </Grid.Column>
            </Grid.Row>
        </Grid>
    );
}

export default ReadyForReturnList;
