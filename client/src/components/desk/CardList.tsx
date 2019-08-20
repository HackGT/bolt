import React, {Component} from "react";
import {Container, Grid, Segment} from "semantic-ui-react";

interface CardListProps {
    title: string;
    length: number;
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
                <Segment attached="top">{this.props.length} request{this.props.length === 1 ? "" : "s"}</Segment>
                <Container placeholder className="hw-list">
                    {this.props.children}
                </Container>
            </Grid.Column>
        );
    }
}

export default CardList;
