import React, { useState } from "react";
import { connect } from "react-redux";
import { Checkbox, DropdownProps, Grid, Header, Loader, Message, Select } from "semantic-ui-react";
import { useQuery } from "@apollo/client";

import SubmittedList from "./submitted/SubmittedList";
import { REQUEST_CHANGE } from "../../../graphql/Subscriptions";
import ReadyToPrepareList from "./fulfillment/ReadyToPrepareList";
import { DESK_REQUESTS } from "../../../graphql/Queries";
import { Request, RequestStatus } from "../../../types/Request";
import {
  APPROVED,
  DAMAGED,
  FULFILLED,
  Location,
  LOST,
  READY_FOR_PICKUP,
  SUBMITTED,
} from "../../../types/Hardware";
import { pickRandomElement } from "../AdminOverviewContainer";
import ReadyForPickupList from "./pickup/ReadyForPickupList";
import ReadyForReturnList from "./returns/ReadyForReturnList";

function mapStateToProps(state: any) {
  return {};
}

function getRequestsWithStatus(requests: Request[], statuses: RequestStatus[], id = 0) {
  return requests.filter(
    (r: Request) =>
      (id === 0 || r.item.location.id === id) && statuses.some(status => r.status === status)
  );
}

function getConsolidatedRequestsWithStatus(requests: Request[], statuses: RequestStatus[], id = 0) {
  const filteredRequests = getRequestsWithStatus(requests, statuses, id);
  const requestsByUser: any = {};

  for (let i = 0; i < filteredRequests.length; i++) {
    const req = filteredRequests[i];
    if (!Object.prototype.hasOwnProperty.call(requestsByUser, req.user.uuid)) {
      requestsByUser[req.user.uuid] = {
        user: req.user,
        requests: [],
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
  "3D printers",
];

const starters = ["I am requesting", "I would like", "Please give me"];

const endings = [
  "if you have any",
  "as soon as possible",
  "within the hour",
  `in ${Math.floor((Math.random() + 1) * 60)} minutes`,
];

function getUpdateQuery() {
  return (prev: any, { subscriptionData }: any) => {
    if (!subscriptionData.data) {
      return prev;
    }
    const updatedRequest = subscriptionData.data.requestChange;
    const index: number = prev.requests.findIndex((x: any) => x.id === updatedRequest.id);

    const requests = prev.requests.map((request: any) => ({ ...request }));

    if (index === -1) {
      // request wasn't returned with original query; add it to array of requests
      // If adding a new request to the array of requests, you have to do it this way rather than just pushing to the array
      return { ...prev, requests: [updatedRequest, ...prev.requests] };
    }

    // request was returned with original query; update it
    requests[index] = updatedRequest;

    return { ...prev, requests };
  };
}

function DeskContainer() {
  const { subscribeToMore, ...query } = useQuery(DESK_REQUESTS);
  const randomPhrase = useState(
    `${pickRandomElement(starters)} ${Math.floor((Math.random() + 1) * 900)} ${pickRandomElement(
      funPhrases
    )} ${pickRandomElement(endings)}`
  );
  const [returnsMode, setReturnsMode] = useState(false);
  const [location, setLocation] = useState<number>();

  if (query.loading) {
    return <Loader active inline="centered" content="Loading requests..." />;
  }
  if (query.error) {
    return (
      <Message
        error
        visible
        header="Can't fetch requests"
        content={`Hmm, an error is preventing us from displaying the hardware desk UI.  The error was: ${query.error.message}`}
      />
    );
  }

  if (!location) {
    return (
      <>
        <Header size="huge">
          Hardware Desk
          <Header.Subheader>{randomPhrase}</Header.Subheader>
        </Header>
        <Header size="medium">Select a location to continue</Header>
        <Select
          placeholder="Select a location"
          options={query.data.locations.map((locationOption: Location) => ({
            key: locationOption.id,
            value: locationOption.id,
            text: locationOption.name,
          }))}
          onChange={(event: React.SyntheticEvent<HTMLElement>, data: DropdownProps): void => {
            const { value }: { value?: any } = data;
            setLocation(value);
          }}
        />
      </>
    );
  }
  const { requests } = query.data;
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
            <Checkbox
              toggle
              label="Returns mode"
              onChange={(event, { checked }): any => setReturnsMode(checked ?? false)}
            />
          </Grid.Column>
          <Grid.Column>
            <Select
              placeholder="Select a location"
              value={location}
              options={query.data.locations.map((locationOption: Location) => ({
                key: locationOption.id,
                value: locationOption.id,
                text: locationOption.name,
              }))}
              onChange={(event: React.SyntheticEvent<HTMLElement>, data: DropdownProps): void => {
                const { value }: { value?: any } = data;
                setLocation(value);
              }}
            />
          </Grid.Column>
        </Grid.Row>
        <Grid.Row columns={3}>
          <SubmittedList
            hidden={returnsMode}
            loading={query.loading}
            requests={submitted}
            subscribeToUpdatedRequests={() => {
              subscribeToMore({
                document: REQUEST_CHANGE,
                updateQuery: getUpdateQuery(),
              });
            }}
          />
          {!returnsMode && <ReadyToPrepareList cards={approved} />}
          {!returnsMode && <ReadyForPickupList cards={readyForPickup} />}
          {returnsMode && <ReadyForReturnList cards={readyForReturn} />}
        </Grid.Row>
      </Grid>
    </div>
  );
}

export default connect(mapStateToProps)(DeskContainer);
