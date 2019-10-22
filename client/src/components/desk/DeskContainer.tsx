import React, {useState} from "react";
import {connect} from "react-redux";
import {Checkbox, DropdownProps, Grid, Header, Loader, Message, Select} from "semantic-ui-react";
import SubmittedList from "./submitted/SubmittedList";
import {useQuery} from "@apollo/react-hooks";
import {REQUEST_CHANGE} from "../util/graphql/Subscriptions";
import ReadyToPrepareList from "./fulfillment/ReadyToPrepareList";
import {DESK_REQUESTS} from "../util/graphql/Queries";
import {Request, RequestStatus} from "../../types/Request";
import {APPROVED, DAMAGED, FULFILLED, Location, LOST, READY_FOR_PICKUP, SUBMITTED} from "../../types/Hardware";
import {pickRandomElement} from "../admin/AdminOverviewContainer";
import ReadyForPickupList from "./pickup/ReadyForPickupList";
import ReadyForReturnList from "./returns/ReadyForReturnList";

function mapStateToProps(state: any) {
    return {};
}

function getRequestsWithStatus(requests: Request[], statuses: RequestStatus[], location_id: number = 0) {

    return requests.filter((r: Request) => {
        console.log(r.item, location_id);
        return (location_id === 0 || r.item.location.location_id === location_id)
            && statuses.some(status => r.status === status);
    });
}

function getConsolidatedRequestsWithStatus(requests: Request[], statuses: RequestStatus[], location_id: number = 0) {
    const filteredRequests = getRequestsWithStatus(requests, statuses, location_id);
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
        const updatedRequest = subscriptionData.data;
        const index = prev.requests.findIndex((x: any) => {
            return x.request_id === updatedRequest.request_change.request_id;
        });

        const requests = prev.requests;

        if (index === -1) { // request wasn't returned with original query; add it to array of requests
            // If adding a new request to the array of requests, you have to do it this way rather than just pushing to the array
            return Object.assign({}, prev, {
                requests: [updatedRequest.request_change, ...prev.requests]
            });
        } else { // request was returned with original query; update it
            requests[index] = updatedRequest.request_change;
        }
        return {requests};
    };
}

function DeskContainer() {
    const {subscribeToMore, ...query} = useQuery(DESK_REQUESTS);
    const [randomPhrase, setRandomPhrase] = useState(`${pickRandomElement(starters)} ${Math.floor((Math.random() + 1) * 900)} ${pickRandomElement(funPhrases)} ${pickRandomElement(endings)}`);
    const [returnsMode, setReturnsMode] = useState(false);
    const [location, setLocation] = useState();

    if (query.loading) {
        return <Loader active inline="centered" content="Loading requests..."/>;
    }
    if (query.error) {
        return <Message error visible={true}
                        header="Can't fetch requests"
                        content={`Hmm, an error is preventing us from displaying the hardware desk UI.  The error was: ${query.error.message}`}
        />;
    }

    if (!location) {
        return <>
            <Header size="huge">
                Hardware Desk
                <Header.Subheader>{randomPhrase}</Header.Subheader>
            </Header>
            <Header size={"medium"}>Select a location to continue</Header>
            <Select placeholder={"Select a location"} options={
                query.data.locations.map((location: Location) => {
                    return {
                        key: location.location_id,
                        value: location.location_id,
                        text: location.location_name
                    };
                })
            }
                    onChange={(event: React.SyntheticEvent<HTMLElement>, data: DropdownProps): void => {
                        console.log(data);
                        const value = data.value;
                        setLocation(value);
                    }}
            />
        </>;
    }
    const requests = query.data.requests;
    const submitted = getRequestsWithStatus(requests, [SUBMITTED], location);
    const approved = getConsolidatedRequestsWithStatus(requests, [APPROVED], location);
    const readyForPickup = getConsolidatedRequestsWithStatus(requests, [READY_FOR_PICKUP], location);
    const readyForReturn = getConsolidatedRequestsWithStatus(requests, [FULFILLED, LOST, DAMAGED]);

    return (
        <div>
            <Header size="huge">
                Hardware Desk
                <Header.Subheader>{randomPhrase}</Header.Subheader>
            </Header>


            <Grid stackable>
                <Grid.Row columns={2}>
                    <Grid.Column>
                        <Checkbox toggle
                                  label={"Returns mode"}
                                  onChange={((event, {checked}): any => setReturnsMode(checked!))}
                        />
                    </Grid.Column>
                    <Grid.Column>
                        <Select placeholder={"Select a location"} value={location} options={
                            query.data.locations.map((location: Location) => {
                                return {
                                    key: location.location_id,
                                    value: location.location_id,
                                    text: location.location_name
                                };
                            })
                        }
                                onChange={(event: React.SyntheticEvent<HTMLElement>, data: DropdownProps): void => {
                                    const value = data.value;
                                    setLocation(value);
                                }}
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
                    {returnsMode && (<ReadyForReturnList cards={readyForReturn}/>)}
                </Grid.Row>
            </Grid>
        </div>
    );
}

export default connect(mapStateToProps)(DeskContainer);
