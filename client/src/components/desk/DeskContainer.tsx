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

function getConsolidatedRequestsWithStatus(requests: Request[], status: RequestStatus) {
    const filteredRequests = getRequestsWithStatus(requests, status);
    const requestsByUser: any = {};

    for (let i = 0; i < filteredRequests.length; i++) {
        const req = filteredRequests[i];
        if (!requestsByUser.hasOwnProperty(req.user.uuid)) {
            requestsByUser[req.user.uuid] = {
                user: req.user,
                requests: []
            };
        }

        requestsByUser[req.user.uuid].requests.push(req);
    }
    console.log("rbu", Object.values(requestsByUser));
    return Object.values(requestsByUser);
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
    const approved = getConsolidatedRequestsWithStatus(requests, APPROVED);
    const readyForPickup = getConsolidatedRequestsWithStatus(requests, READY_FOR_PICKUP);

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
                                console.log("Original requests array", prev.requests);
                                const updatedRequest = subscriptionData.data;
                                const index = prev.requests.findIndex((x: any) => {
                                    return x.request_id === updatedRequest.request_change.request_id;
                                });

                                console.log("Found request #", updatedRequest.request_change.request_id, " at index", index, ", new status is", updatedRequest.request_change.status);
                                const requests = prev.requests;

                                if (index === -1) { // request wasn't returned with original query; add it to array of requests
                                    requests.push(updatedRequest.request_change);
                                    console.log("Saved new request");
                                } else { // request was returned with original query; update it
                                    requests[index] = updatedRequest.request_change;
                                    console.log("Updated existing request");
                                }
                                console.log("New requests array", requests);
                                return {requests};
                            }
                        });
                    }}/>
                    <ReadyToPrepareList cards={approved}/>
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
