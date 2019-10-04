import React, {useState} from "react";
import {connect} from "react-redux";
import {Checkbox, Grid, Header, Loader, Message} from "semantic-ui-react";
import SubmittedList from "./submitted/SubmittedList";
import {useQuery} from "@apollo/react-hooks";
import {REQUEST_CHANGE} from "../util/graphql/Subscriptions";
import ReadyToPrepareList from "./fulfillment/ReadyToPrepareList";
import {DESK_REQUESTS} from "../util/graphql/Queries";
import {Request, RequestStatus} from "../../types/Request";
import {APPROVED, DAMAGED, FULFILLED, LOST, READY_FOR_PICKUP, SUBMITTED} from "../../types/Hardware";
import {pickRandomElement} from "../admin/AdminOverviewContainer";
import ReadyForPickupList from "./pickup/ReadyForPickupList";
import ReadyForReturnList from "./returns/ReadyForReturnList";

function mapStateToProps(state: any) {
    return {};
}

function getRequestsWithStatus(requests: Request[], statuses: RequestStatus[]) {
    console.log("Getting requests with status", status);
    return requests.filter((r: Request) => statuses.some(status => r.status === status));
}

function getConsolidatedRequestsWithStatus(requests: Request[], statuses: RequestStatus[]) {
    const filteredRequests = getRequestsWithStatus(requests, statuses);
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

const funPhrases = [
    "Arduino Unos",
    "mangoes",
    "Raspberry Pis",
    "HackGT check-in boxes",
    "copies of Bolt",
    "screws",
    "Oculus Rifts",
    "LED strings",
    "VR headsets",
    "3D printers"
];

const starters = [
    "I am requesting",
    "I would like",
    "Please give me"
];

const endings = [
    "if you have any",
    "as soon as possible",
    "within the hour",
    `in ${Math.floor((Math.random() + 1) * 60)} minutes`
];


function getUpdateQuery() {
    return (prev: any, {subscriptionData}: any) => {
        if (!subscriptionData.data) {
            return prev;
        }
        console.log("Original requests array");
        prev.requests.forEach((x: any) => console.log(x));
        const updatedRequest = subscriptionData.data;
        const index = prev.requests.findIndex((x: any) => {
            return x.request_id === updatedRequest.request_change.request_id;
        });

        console.log("Found request #", updatedRequest.request_change.request_id, " at index", index, ", new status is", updatedRequest.request_change.status);
        const requests = prev.requests;

        if (index === -1) { // request wasn't returned with original query; add it to array of requests
            // If adding a new request to the array of requests, you have to do it this way rather than just pushing to the array
            return Object.assign({}, prev, {
                requests: [updatedRequest.request_change, ...prev.requests]
            });
        } else { // request was returned with original query; update it
            requests[index] = updatedRequest.request_change;
            console.log("Updated existing request");
        }
        console.log("New requests array", requests);
        return {requests};
    };
}

function DeskContainer() {
    const {subscribeToMore, ...query} = useQuery(DESK_REQUESTS);
    const [randomPhrase, setRandomPhrase] = useState(`${pickRandomElement(starters)} ${Math.floor((Math.random() + 1) * 900)} ${pickRandomElement(funPhrases)} ${pickRandomElement(endings)}`);
    const [returnsMode, setReturnsMode] = useState(false);
    if (query.loading) {
        return <Loader active inline="centered" content="Loading requests..."/>;
    }
    if (query.error) {
        return <Message error visible={true}
                        header="Can't fetch requests"
                        content={`Hmm, an error is preventing us from displaying the hardware desk UI.  The error was: ${query.error.message}`}
        />;
    }
    const requests = query.data.requests;
    const submitted = getRequestsWithStatus(requests, [SUBMITTED]);
    const approved = getConsolidatedRequestsWithStatus(requests, [APPROVED]);
    const readyForPickup = getConsolidatedRequestsWithStatus(requests, [READY_FOR_PICKUP]);
    const readyForReturn = getConsolidatedRequestsWithStatus(requests, [FULFILLED, LOST, DAMAGED]);
    return (
        <div>
            <Header size="huge">
                Hardware Desk
                <Header.Subheader>{randomPhrase}</Header.Subheader>
            </Header>

            <Grid stackable>
                <Grid.Row columns={1}>
                    <Grid.Column>
                        <Checkbox toggle
                                  label={"Returns mode"}
                                  onChange={((event, {checked}): any => setReturnsMode(checked!))}
                        />
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row columns={3}>
                    <SubmittedList hidden={returnsMode} loading={query.loading} requests={submitted}
                                   subscribeToUpdatedRequests={() => {
                        subscribeToMore({
                            document: REQUEST_CHANGE,
                            updateQuery: getUpdateQuery()
                        });
                    }}/>
                    {!returnsMode && <ReadyToPrepareList cards={approved}/>}
                    {!returnsMode && <ReadyForPickupList cards={readyForPickup}/>}
                    {returnsMode && <ReadyForReturnList cards={readyForReturn}/>}
                </Grid.Row>
            </Grid>
        </div>
    );
}

export default connect(mapStateToProps)(DeskContainer);
