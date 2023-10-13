import { Box, Flex, Heading, Icon, IconButton, Text, Tooltip, useToast } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { MapPinIcon } from "@heroicons/react/24/solid";
import { DeleteIcon } from "@chakra-ui/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import useAxios from "axios-hooks";
import { apiUrl, LoadingScreen, ErrorScreen, Service, handleAxiosError } from "@hex-labs/core";

import { Request, RequestStatus } from "../../types/Request";
import { APPROVED, DENIED, READY_FOR_PICKUP, SUBMITTED } from "../../types/Hardware";

interface RequestedListProps {
  requests: Request[];
}

const RequestCard = ({ r, statuses, requestDeleteMutation }: any) => {
  const { data, isLoading } = useQuery(["item"], () =>
    axios.get(apiUrl(Service.HARDWARE, `/items/${r.item.id}`))
  );

  return (
    <Box p="4" backgroundColor="white" borderRadius="8px" boxShadow="md">
      {!isLoading && (
        <>
          <Flex alignItems="center" justifyContent="space-between">
            <Flex flexDir="column" gap="4px" mb="8px">
              <Heading as="h4" size="md">
                {data!.data.name}
              </Heading>
              <Text color="gray.500">{`Qty: ${r.quantity}`}</Text>
              <Flex dir="row" color="gray.500" alignItems="center">
                <Box w={6} h={6} mr={2}>
                  <MapPinIcon />
                </Box>
                <Text>{data!.data.location}</Text>
              </Flex>
            </Flex>
            <Tooltip label="Cancel request">
              <IconButton
                aria-label="delete"
                variant="ghost"
                colorScheme="red"
                onClick={() => requestDeleteMutation(r.id)}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Flex>
          {statuses(r.status)}
        </>
      )}
    </Box>
  );
};

const RequestedList = ({ requests }: RequestedListProps) => {
  const [{ data: requestData, loading, error}, requestRefetch] = useAxios(apiUrl(Service.HARDWARE, "/hardware-requests"));
  const [{ data: itemData, loading: itemLoading, error: itemError}, itemRefetch] = useAxios(apiUrl(Service.HARDWARE, "/items"));
  const [userRequests, setUserRequests] = useState(requests);
  const toast = useToast();
  if (loading) {
    return <LoadingScreen />;
  }
  if (error) {
    return <ErrorScreen error={error} />;
  }
  const handleRequestDelete = async (requestId: string) => {
    try {
      await axios.delete(apiUrl(Service.HARDWARE, `/hardware-requests/${requestId}`));
      toast({
        title: "Request deleted",
        description: "Your request has been deleted!",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (e: any) {
      handleAxiosError(e);
    }
    finally {
      requestRefetch();
      itemRefetch();
      setUserRequests(requestData!.data as Request[])
    }
  };
  const statuses = (status: RequestStatus): JSX.Element => {
    switch (status) {
      case SUBMITTED:
        return (
          <Box
            borderRadius="8px"
            w="full"
            textAlign="center"
            bgGradient="linear(to-r, purple.500, purple.400)"
            fontWeight="semibold"
            py={1.5}
            color="white"
          >
            Submitted
          </Box>
        );
      case APPROVED:
        return (
          <Box
            w="full"
            textAlign="center"
            bgGradient="linear(to-r, green.200, green.300)"
            fontWeight="semibold"
            borderRadius="8px"
            py={1.5}
            color="white"
          >
            Approved
          </Box>
        );
      case DENIED:
        return (
          <Box
            borderRightRadius="8px"
            w="full"
            textAlign="center"
            borderRadius="8px"
            fontWeight="semibold"
            backgroundColor="red.400"
            py={1.5}
            color="white"
          >
            Denied
          </Box>
        );
      case READY_FOR_PICKUP:
        return (
          <Box
            borderRightRadius="8px"
            w="full"
            textAlign="center"
            borderRadius="8px"
            py={1.5}
            fontWeight="semibold"
            bgGradient="linear(to-r, cyan.400, purple.500)"
            color="white"
          >
            Ready for Pickup
          </Box>
        );
      default:
        return (
          <Box
            borderRightRadius="8px"
            w="full"
            textAlign="center"
            borderRadius="8px"
            backgroundColor="gray.400"
            fontWeight="semibold"
            py={1.5}
            color="white"
          >
            {status.toUpperCase()[0] + status.slice(1).toLowerCase()}
          </Box>
        );
    }
  };

  return (
    <Box w="45%">
      <Heading mb="4">My Requests</Heading>
      <Flex
        borderRadius="4px"
        backgroundColor="gray.200"
        w="full"
        p="4"
        minH="200px"
        gap="4"
        flexDir="column"
      >
        {userRequests && userRequests.length > 0 ? (
          userRequests
            .sort(
              (a: Request, b: Request) =>
                a.item.location.id.toString().localeCompare(b.item.location.id.toString()) ||
                a.item.name.localeCompare(b.item.name) ||
                a.id.toString().localeCompare(b.id.toString())
            )
            .map(r => (
              <RequestCard
                key={r.id}
                r={r}
                requestDeleteMutation={handleRequestDelete}
                statuses={statuses}
              />
            ))
        ) : (
          <Box my="auto" mx="auto" fontWeight="semibold" color="gray.600">
            Requests you make will appear here!
          </Box>
        )}
      </Flex>
    </Box>
  );
};

export default RequestedList;