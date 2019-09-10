import React from "react";
import {connect} from "react-redux";
import {Container, Grid, Header, Segment} from "semantic-ui-react";
import CardList from "./CardList";
import SubmittedList from "./submitted/SubmittedList";
import {useQuery, useSubscription} from "@apollo/react-hooks";
import {REQUEST_CHANGE} from "../util/graphql/Subscriptions";
import ReadyToPrepareList from "./fulfillment/ReadyToPrepareList";

function mapStateToProps(state: any) {
    return {};
}

function mapDispatchToProps(dispatch: any) {
    return {};
}

function DeskContainer() {
    //const query = useQuery(HARDWARE_DESK_REQUESTS)

    const {data, loading} = useSubscription(
        REQUEST_CHANGE
    );
    console.log("data, loading", data, loading);
    return (
        <div>
            <Header size="huge">Hardware Desk</Header>
            <Grid stackable>
                <Grid.Row columns={3}>
                    <SubmittedList/>
                    <ReadyToPrepareList cards={[]}/>
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
