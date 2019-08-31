import React from "react";
import {Container, Grid, Loader, Segment} from "semantic-ui-react";

interface CardListProps {
    title: string;
    length: number;
    loading?: boolean;
}

const CardList: React.FunctionComponent<CardListProps> = props => {
    const spinner = <Loader active inline="centered" content="Just a sec!"/>;

    return (
        <Grid.Column>
            <h2>{props.title}</h2>
            <Segment attached="top">{props.length} request{props.length === 1 ? "" : "s"}</Segment>
            <Container className="hw-list">
                {props.loading ? spinner : props.children}
            </Container>
        </Grid.Column>
    );
};

export default CardList;
