import React from "react";
import {connect} from "react-redux";
import {Container, Grid, Header, Segment} from "semantic-ui-react";
import CardList from "./CardList";
import SubmittedList from "./submitted/SubmittedList";
import gql from "graphql-tag";
import {useSubscription} from "@apollo/react-hooks";

function mapStateToProps(state: any) {
    return {};
}

function mapDispatchToProps(dispatch: any) {
    return {};
}

const REQUEST_CHANGE_SUBSCRIPTION = gql`
    subscription rc {
        request_change
    }
`;


function DeskContainer() {
    const {data, loading} = useSubscription(
        REQUEST_CHANGE_SUBSCRIPTION
    );
    console.log("data, loading", data, loading);
    return (
        <div>
            <Header size="huge">Hardware Desk</Header>
            <Grid stackable>
                <Grid.Row columns={3}>
                    <SubmittedList/>
                    <CardList title="Ready to Prepare" length={0}>
                        <Segment placeholder>
                            <Container textAlign="center">
                                <Header>
                                    Nothing to prepare. Take a break!
                                </Header>
                            </Container>
                        </Segment>
                    </CardList>
                    <CardList title="Ready for Pickup" length={0}>
                        <Segment placeholder>
                            <Container textAlign="center">
                                <Header>
                                    No requests awaiting pickup. Take a break!
                                </Header>
                            </Container>
                        </Segment>
                    </CardList>
                </Grid.Row>
            </Grid>
        </div>
    );
}

export default connect(mapStateToProps)(DeskContainer);
