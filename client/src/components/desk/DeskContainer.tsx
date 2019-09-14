import React from "react";
import {connect} from "react-redux";
import {Container, Grid, Header, Segment} from "semantic-ui-react";
import CardList from "./CardList";
import SubmittedList from "./submitted/SubmittedList";
import {useQuery} from "@apollo/react-hooks";
import {REQUEST_CHANGE} from "../util/graphql/Subscriptions";
import ReadyToPrepareList from "./fulfillment/ReadyToPrepareList";
import {DESK_REQUESTS} from "../util/graphql/Queries";
import {Request, RequestStatus} from "../../types/Request";
import {APPROVED, READY_FOR_PICKUP, SUBMITTED} from "../../types/Hardware";

function mapStateToProps(state: any) {
    return {};
}

function getRequestsWithStatus(requests: Request[], status: RequestStatus) {
    return requests.filter((r: Request) => r.status === status);
}

function DeskContainer() {
    const {subscribeToMore, ...query} = useQuery(DESK_REQUESTS);

    if (query.loading) {
        return <p>Loading...</p>;
    }
    if (query.error) {
        return <p>Error!</p>
    }
    const requests = query.data.requests;
    const submitted = getRequestsWithStatus(requests, SUBMITTED);
    const approved = getRequestsWithStatus(requests, APPROVED);
    const readyForPickup = getRequestsWithStatus(requests, READY_FOR_PICKUP);

    return (
        <div>
            <Header size="huge">Hardware Desk</Header>
            <Grid stackable>
                <Grid.Row columns={3}>
                    <SubmittedList loading={query.loading} requests={submitted} subscribeToUpdatedRequests={() => {
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
