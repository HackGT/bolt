import React, {Component} from "react";
import {Container, Grid, Segment} from "semantic-ui-react";

interface CardListProps {
    title: string;

}

interface CardListState {

}

class CardList extends Component<CardListProps, CardListState> {
    constructor(props: CardListProps) {
        super(props);
    }

    public render() {
        return (
            <Grid.Column>
                <h2>{this.props.title}</h2>
                <Segment attached="top">18 requests</Segment>
                <Container placeholder className="hw-list">
                    {this.props.children}
                </Container>
            </Grid.Column>
        );
    }
}

export default CardList;
