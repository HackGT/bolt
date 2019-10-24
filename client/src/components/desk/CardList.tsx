import React, {ReactElement, useState} from "react";
import {Container, Grid, Header, Input, Segment} from "semantic-ui-react";

interface CardListProps {
    title: string;
    length: number;
    loading?: boolean;
    cards: any;
    render: (elem: any) => ReactElement;
    filter: (elem: any, query: string) => boolean
    empty: any;
}

const CardList: React.FunctionComponent<CardListProps> = props => {
    const [searchQuery, setSearchQuery] = useState("");

    const cards = props.cards.filter((elem: any) => props.filter(elem, searchQuery)).map((elem: any) => props.render(elem));
    const noResults = (<Segment placeholder>
        <Container textAlign="center">
            <Header>
                No search results found
            </Header>
        </Container>
    </Segment>);

    let content = cards;

    if (searchQuery && !cards.length) {
        content = noResults;
    } else if (!cards.length) {
        content = props.empty;
    }

    return (
        <Grid.Column>
            <h2>{props.title}</h2>
            <Input type="text"
                   icon="search"
                   placeholder="Search..."
                   name="searchQuery"
                   fluid
                   style={{
                       marginBottom: 10
                   }}
                   onChange={(e, {value}) => {
                       setSearchQuery(value.trim().toLowerCase());
                   }}
            />
            <Segment attached="top">{props.length} request{props.length === 1 ? "" : "s"}</Segment>
            <Container className="hw-list">
                {content}
            </Container>
        </Grid.Column>
    );
};

export default CardList;
