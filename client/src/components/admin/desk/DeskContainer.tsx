import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { Checkbox, DropdownProps, Grid, Header, Loader, Message } from "semantic-ui-react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { apiUrl, ErrorScreen, LoadingScreen, Service, useAuth } from "@hex-labs/core";
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
  DENIED,
  DAMAGED,
  FULFILLED,
  Location,
  LOST,
  READY_FOR_PICKUP,
  SUBMITTED,
} from "../../../types/Hardware";
import { pickRandomElement } from "../AdminHub";
import SubmittedTable from "./submitted/SubmittedTable";
import SubmittedCards from "./submitted/SubmittedCards";
import FulfilledCards from "./fulfillment/FulfilledCards";
import ReturnedCards from "./returns/ReturnedCards";
import useAxios from "axios-hooks";
import LoadingSpinner from "../../util/LoadingSpinner";

function getRequestsWithStatus(requests: Request[], statuses: RequestStatus[], id: string) {
  return requests.filter((r: Request) => id === "" && statuses.some(status => r.status === status));
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

    requestsByUser[req.user.userId].requests.push(req);
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
  const [{ data: requestQuery, loading: reqloading, error: reqError }, reqRefetch] = useAxios({
    url: apiUrl(Service.HARDWARE, "/hardware-requests"),
    method: "GET",
  });

  // const requestQuery = useQuery(["deskRequests"], async () => {
  //   const requests = await axios.get(apiUrl(Service.HARDWARE, "/hardware-requests"));
  //   return requests.data;
  // });
  const [{ data: locationQuery, loading: locationLoading, error: locationError }] = useAxios({
    url: apiUrl(Service.HARDWARE, "/locations"),
    method: "GET",
  });

  // useQuery(["locations"], async () => {
  //   const locations = await
  //   return locations.data;
  // });
  const [workingLocation, setWorkingLocation] = useState("");

  const [{ data: itemQuery, loading: itemLoading, error: itemError }] = useAxios({
    url: apiUrl(Service.HARDWARE, "/items"),
    method: "GET",
    params: {
      cacheTime: 0,
    },
  });
  // const itemQuery = useQuery(["items"], () => axios.get(), {
  //   cacheTime: 0,
  // });

  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [randomPhrase, setRandomPhrase] = useState<string>(
    `${pickRandomElement(starters)} ${Math.floor((Math.random() + 1) * 900)} ${pickRandomElement(
      funPhrases
    )} ${pickRandomElement(endings)}`
  );
  const [returnsMode, setReturnsMode] = useState(false);
  const { location } = useParams();

  const [requests, setRequests] = useState<Request[]>([]);

  useEffect(() => {
    if (requestQuery) {
      setRequests(requestQuery);
    }
  }, [requestQuery]);

  const [items, setItems] = useState<Request[]>([]);

  useEffect(() => {
    if (itemQuery) {
      setItems(itemQuery);
    }
  }, [itemQuery]);

  if (reqError || locationError) {
    return <ErrorScreen error={(reqError || locationError) as Error} />;
  }

  if (reqloading || locationLoading || itemLoading || loading) {
    return <LoadingScreen />;
  }

  const locations: Location[] = Array.from(new Set(items.map((item: any) => item.location)));

  if (!workingLocation) {
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
            setWorkingLocation(`${e.target.value}`);
          }}
          value={workingLocation}
        >
          {locations &&
            locations.map((locationOption: any) => (
              <option key={locationOption.id} value={locationOption.name}>
                {locationOption.name}
              </option>
            ))}
        </Select>
      </Container>
    );
  }

  const submitted = getRequestsWithStatus(requests, [SUBMITTED], workingLocation);
  const denied = getConsolidatedRequestsWithStatus(requests, [DENIED], workingLocation, user!);
  const readyForPickup = getConsolidatedRequestsWithStatus(
    requests,
    [READY_FOR_PICKUP],
    workingLocation,
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
        <Flex w="50%" gap="4" alignItems="center" mb="4">
          <Heading size="md" mb={2}>
            Select a location to continue
          </Heading>
          <Select
            placeholder="Select a location"
            onChange={(e): void => {
              setWorkingLocation(`${e.target.value}`);
            }}
            value={workingLocation}
          >
            {locations &&
              locations.map((locationOption: any) => (
                <option key={locationOption.id} value={locationOption.name}>
                  {locationOption.name}
                </option>
              ))}
          </Select>
        </Flex>
        {!reqloading ? (
          <Flex flexDir="column">
            <Tabs variant="enclosed">
              <TabList>
                <Tab>Submissions</Tab>
                <Tab>Checkout</Tab>
                <Tab>Returns</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  {requests && (
                    <SubmittedCards
                      requests={requests.filter((request: Request) => {
                        const locationName = request.item.location.name;
                        return locationName === workingLocation;
                      })}
                      refetch={reqRefetch}
                    />
                  )}
                </TabPanel>
                <TabPanel>
                  {requests && (
                    <FulfilledCards
                      requests={requests.filter((request: Request) => {
                        const locationName = request.item.location.name;
                        return locationName === workingLocation;
                      })}
                      refetch={reqRefetch}
                    />
                  )}
                </TabPanel>
                <TabPanel>
                  {requests && (
                    <ReturnedCards
                      requests={requests.filter((request: Request) => {
                        const locationName = request.item.location.name;
                        return locationName === workingLocation;
                      })}
                    />
                  )}
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Flex>
        ) : (
          <LoadingSpinner />
        )}
      </Flex>
    </Box>
  );
}

export default DeskContainer;
