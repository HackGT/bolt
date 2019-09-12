import React, {useState} from "react";
import {connect} from "react-redux";
import {Container, Grid, Header, Segment} from "semantic-ui-react";
import CardList from "./CardList";
import SubmittedList from "./submitted/SubmittedList";
import {useQuery, useSubscription} from "@apollo/react-hooks";
import {REQUEST_CHANGE} from "../util/graphql/Subscriptions";
import ReadyToPrepareList from "./fulfillment/ReadyToPrepareList";
import {DESK_REQUESTS} from "../util/graphql/Queries";
import {fillRequests} from "../../state/Desk";

function mapStateToProps(state: any) {
    return {};
}

// function mapDispatchToProps(dispatch: any) {
//     return {
//         fillRequests: requests => dispatch(fillRequests(requets))
//     };
// }

function DeskContainer() {
    const {subscribeToMore, ...query} = useQuery(DESK_REQUESTS);

    const [requests, setRequests] = useState({});
    //console.log(query.data, query.loading, query.error);

    // const {data, loading} = useSubscription(
    //     REQUEST_CHANGE
    // );
    // console.log("data, loading", data, loading);
    console.log(query.data);
    if (query.loading) {
        return <p>Loading...</p>;
    }
    if (query.error) {
        return <p>Error!</p>
    }

    return (
        <div>
            <Header size="huge">Hardware Desk</Header>
            <Grid stackable>
                <Grid.Row columns={3}>
                    <SubmittedList data={query.data} subscribeToUpdatedRequests={() => {
                        subscribeToMore({
                            document: REQUEST_CHANGE,
                            updateQuery: (prev, {subscriptionData}) => {
                                if (!subscriptionData.data) {
                                    return prev;
                                }
                                console.log("original requests", prev.requests);
                                const updatedRequest = subscriptionData.data;
                                const index = prev.requests.findIndex((x: any) => {
                                    console.log("comparing", x.request_id, updatedRequest.request_change.request_id);
                                    return x.id === updatedRequest.request_change.id;
                                });
                                console.log("the new request data is", updatedRequest);
                                console.log("index is", index);
                                const requests = prev.requests;
                                // if (prev.requests.length > 0) {
                                //     requests.splice(index, 1)
                                // }
                                requests[index] = updatedRequest.request_change;
                                console.log("changed requests", requests);
                                return {requests};
                            }
                        });
                    }}/>
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
