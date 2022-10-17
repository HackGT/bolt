import React, { useState } from "react";
import { connect } from "react-redux";
import { Checkbox, DropdownProps, Grid, Header, Loader, Message } from "semantic-ui-react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { LoadingScreen, useAuth } from "@hex-labs/core";
import {
  Box,
  Container,
  Flex,
  FormLabel,
  Heading,
  Select,
  Switch,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@chakra-ui/react";
import { User } from "firebase/auth";
import { useNavigate, useParams } from "react-router-dom";

import SubmittedList from "./submitted/SubmittedList";
import { REQUEST_CHANGE } from "../../../graphql/Subscriptions";
import ReadyToPrepareList from "./fulfillment/ReadyToPrepareList";
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
import SubmittedTable from "./submitted/SubmittedTable";
import SubmittedCards from "./submitted/SubmittedCards";

function getRequestsWithStatus(requests: Request[], statuses: RequestStatus[], id: string) {
  return requests.filter(
    (r: Request) =>
      (id === "" || r.item.location.id === id) && statuses.some(status => r.status === status)
  );
}

function getConsolidatedRequestsWithStatus(
  requests: Request[],
  statuses: RequestStatus[],
  id: string,
  user: User
): { user: User; requests: Request[] }[] {
  const filteredRequests = getRequestsWithStatus(requests, statuses, id);
  const requestsByUser: Record<string, { user: User; requests: Request[] }> = {};

  for (let i = 0; i < filteredRequests.length; i++) {
    const req = filteredRequests[i];
    if (!Object.prototype.hasOwnProperty.call(requestsByUser, user.uid)) {
      requestsByUser[user.uid] = {
        user,
        requests: [],
      };
    }

    requestsByUser[req.user.uid].requests.push(req);
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
  const requestQuery = useQuery(["deskRequests"], async () => {
    const requests = await axios.get("/requests");
    return requests.data;
  });
  const locationQuery = useQuery(["locations"], async () => {
    const locations = await axios.get("/locations");
    return locations.data;
  });

  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [randomPhrase, setRandomPhrase] = useState<string>(
    `${pickRandomElement(starters)} ${Math.floor((Math.random() + 1) * 900)} ${pickRandomElement(
      funPhrases
    )} ${pickRandomElement(endings)}`
  );
  const [returnsMode, setReturnsMode] = useState(false);
  const { location } = useParams();

  if (requestQuery.status === "error" || locationQuery.status === "error") {
    return (
      <Message
        error
        visible
        header="Can't fetch requests"
        content={`Hmm, an error is preventing us from displaying the hardware desk UI.  The error was: ${
          (requestQuery.error as Error).message || (locationQuery.error as Error).message
        }`}
      />
    );
  }

  if (requestQuery.isLoading || locationQuery.isLoading) {
    return <LoadingScreen />;
  }

  if (!location) {
    return (
      <Container p="8" maxW="container.md">
        <Heading size="2xl">Hardware Desk</Heading>
        <Heading size="md" color="gray.400" mb="8" mt="2">
          {randomPhrase}
        </Heading>
        <Heading size="md" mb={2}>
          Select a location to continue
        </Heading>
        <Select
          placeholder="Select a location"
          onChange={(e): void => {
            navigate(`./${e.target.value}`);
          }}
          value={location}
        >
          {locationQuery.data.map((locationOption: Location) => (
            <option value={locationOption.id}>{locationOption.name}</option>
          ))}
        </Select>
      </Container>
    );
  }
  const requests = requestQuery.data;
  const submitted = getRequestsWithStatus(requests, [SUBMITTED], location);
  const approved = getConsolidatedRequestsWithStatus(requests, [APPROVED], location, user!);
  const readyForPickup = getConsolidatedRequestsWithStatus(
    requests,
    [READY_FOR_PICKUP],
    location,
    user!
  );
  const readyForReturn = getConsolidatedRequestsWithStatus(
    requests,
    [FULFILLED, LOST, DAMAGED],
    "",
    user!
  );

  return (
    <Box p="8" w="w-screen">
      <Heading size="2xl">Hardware Desk</Heading>
      <Heading size="md" color="gray.400" mt="2" mb="8">
        {randomPhrase}
      </Heading>

      <Flex flexDir="column">
        {/* <Flex w="full">
          <FormLabel htmlFor="returnMode" mb="0">
            Return mode
          </FormLabel>
          <Switch id="returnMode" onChange={event => setReturnsMode(event.target.checked)} />
        </Flex> */}
        <Flex w="50%" gap="4" alignItems="center" mb="4">
          <Heading size="md" mb={2} whiteSpace="nowrap">
            Location:
          </Heading>
          <Select
            placeholder="Select a location"
            onChange={(e): void => {
              navigate(`./${e.target.value}`);
            }}
            value={location}
          >
            {locationQuery.data.map((locationOption: Location) => (
              <option value={locationOption.id}>{locationOption.name}</option>
            ))}
          </Select>
        </Flex>
        <Flex flexDir="column">
          <Tabs variant="enclosed">
            <TabList>
              <Tab>Card view</Tab>
              <Tab>Table view</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <SubmittedCards requests={requests} />
                {/* <SubmittedList
                  hidden={returnsMode}
                  loading={requestQuery.isLoading}
                  requests={submitted}
                  subscribeToUpdatedRequests={() => {
                    // subscribeToMore({
                    //   document: REQUEST_CHANGE,
                    //   updateQuery: getUpdateQuery(),
                    // });
                  }}
                /> */}
                {/* {!returnsMode && <ReadyToPrepareList cards={approved} />}
                {!returnsMode && <ReadyForPickupList cards={readyForPickup} />}
                {returnsMode && <ReadyForReturnList cards={readyForReturn} />} */}
              </TabPanel>
              <TabPanel>
                <SubmittedTable />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Flex>
      </Flex>
    </Box>
  );
}

export default DeskContainer;
