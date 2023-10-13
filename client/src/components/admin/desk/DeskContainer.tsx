import React, { useEffect, useState } from "react";
import { apiUrl, LoadingScreen, Service } from "@hex-labs/core";
import axios from "axios";
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
import { useNavigate } from "react-router-dom";
import { Request, RequestStatus } from "../../../types/Request";
import {
  DENIED,
  FULFILLED,
  Location,
  DAMAGED_LOST,
  READY_FOR_PICKUP,
  SUBMITTED,
  Item,
  RETURNED,
} from "../../../types/Hardware";
import { pickRandomElement } from "../AdminHub";
import SubmittedCards from "./submitted/SubmittedCards";
import FulfilledCards from "./fulfillment/FulfilledCards";
import ReturnedCards from "./returns/ReturnedCards";
import LoadingSpinner from "../../util/LoadingSpinner";
import { useQuery } from "@tanstack/react-query";
import { BaseUserWithID } from "../../../types/User";

function getRequestsWithStatus(requests: Request[], statuses: RequestStatus[], id: string) {
  return requests.filter((r: Request) => id === "" && statuses.some(status => r.status === status));
}

function getConsolidatedRequestsWithStatus(
  requests: Request[],
  statuses: RequestStatus[],
  id: string
): { user: BaseUserWithID; requests: Request[] }[] {
  const filteredRequests = getRequestsWithStatus(requests, statuses, id);
  const requestsByUser: Record<string, { user: BaseUserWithID; requests: Request[] }> = {};

  filteredRequests.forEach((req: Request) => {
    if (!Object.prototype.hasOwnProperty.call(requestsByUser, req.user.userId)) {
      requestsByUser[req.user.userId] = {
        user: req.user,
        requests: [],
      };
    }

    requestsByUser[req.user.userId].requests.push(req);
  });

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
  const {
    data: requestsData,
    isLoading: requestsLoading,
    refetch: requestRefetch,
  } = useQuery(["requests"], async () => axios.get(apiUrl(Service.HARDWARE, "/hardware-requests")));
  const [requests, setRequests] = useState<Request[]>([]);

  useEffect(() => {
    if (requestsData) {
      setRequests(requestsData.data);
    }
  }, [requestsData]);

  const { data: locationData, isLoading: locationLoading } = useQuery(["locations"], async () =>
    axios.get(apiUrl(Service.HARDWARE, "/locations"))
  );
  const [workingLocation, setWorkingLocation] = useState("");

  const { data: itemsData, isLoading: itemsLoading } = useQuery(["items"], async () =>
    axios.get(apiUrl(Service.HARDWARE, "/items"))
  );

  const navigate = useNavigate();

  const [randomPhrase, setRandomPhrase] = useState<string>(
    `${pickRandomElement(starters)} ${Math.floor((Math.random() + 1) * 900)} ${pickRandomElement(
      funPhrases
    )} ${pickRandomElement(endings)}`
  );

  const [items, setItems] = useState<Item[]>([]);
  useEffect(() => {
    if (itemsData) {
      setItems(itemsData.data);
    }
  }, [itemsData]);

  if (requestsLoading || locationLoading || itemsLoading) {
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
          {locationData &&
            locationData.data.map((locationOption: any) => (
              <option key={locationOption.id} value={locationOption.name}>
                {locationOption.name}
              </option>
            ))}
        </Select>
      </Container>
    );
  }

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
        {!requestsLoading ? (
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
                        const { status } = request;
                        return (
                          locationName === workingLocation &&
                          [SUBMITTED, DENIED, READY_FOR_PICKUP].includes(status)
                        );
                      })}
                      refetch={requestRefetch}
                    />
                  )}
                </TabPanel>
                <TabPanel>
                  {requests && (
                    <FulfilledCards
                      requests={requests.filter((request: Request) => {
                        const locationName = request.item.location.name;
                        const { status } = request;
                        return (
                          locationName === workingLocation &&
                          [READY_FOR_PICKUP, FULFILLED].includes(status)
                        );
                      })}
                      refetch={requestRefetch}
                    />
                  )}
                </TabPanel>
                <TabPanel>
                  {requests && (
                    <ReturnedCards
                      requests={requests.filter((request: Request) => {
                        const locationName = request.item.location.name;
                        const { status } = request;
                        return (
                          locationName === workingLocation &&
                          [FULFILLED, RETURNED, DAMAGED_LOST].includes(status)
                        );
                      })}
                      refetch={requestRefetch}
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
