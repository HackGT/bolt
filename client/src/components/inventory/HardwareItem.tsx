import React, { ChangeEvent, useEffect, useState } from "react";
import { withToastManager } from "react-toast-notifications";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import {
  Box,
  Button,
  Flex,
  Heading,
  Image,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { apiUrl, LoadingScreen, Service, useAuth } from "@hex-labs/core";
import { User } from "firebase/auth";

import { Item, RequestedItem, SUBMITTED } from "../../types/Hardware";
import { AppState } from "../../state/Store";
import { Request } from "../../types/Request";

interface HardwareItemProps {
  item: Item;
  // toastManager: any;
  requestsEnabled: boolean;
  // user: User | null;
  preview?: boolean;
  outOfStock?: boolean;
}

function itemImage(src: string | undefined, outOfStock = false) {
  return (
    <Box boxSize="48">
      <Image
        draggable={false}
        src={
          src ||
          "https://st2.depositphotos.com/2586633/46477/v/450/depositphotos_464771766-stock-illustration-no-photo-or-blank-image.jpg"
        }
        borderRadius="6"
      />
    </Box>
  );
}

interface IRequestMutation {
  item: string;
  quantity: number;
  user: string;
  name: string;
}

const HardwareItem = ({ item, requestsEnabled, preview, outOfStock }: HardwareItemProps) => {
  const [requestedNum, setRequestedNum] = useState(1);
  const toast = useToast();

  const { user, loading } = useAuth();

  const { refetch: requestRefetch } = useQuery(["requests"], () =>
    axios.get(apiUrl(Service.HARDWARE, "/hardware-requests"))
  );
  const { refetch: itemRefetch } = useQuery(["items"], () =>
    axios.get(apiUrl(Service.HARDWARE, "/items"))
  );

  const mutation = useMutation(
    async (newRequest: IRequestMutation): Promise<any> => {
      await axios.post(apiUrl(Service.HARDWARE, "/hardware-requests"), newRequest);
    },
    {
      onSuccess: () => {
        requestRefetch();
        itemRefetch();

        toast({
          title: "Request submitted",
          description: "Your request has been submitted.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      },
      onError: (error: any) => {
        const description =
          error.response?.data?.message || "There was an error submitting your request.";
        toast({
          title: "Error",
          description,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      },
    }
  );

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Flex flexDir="row">
      {itemImage(item.imageUrl)}
      <Flex flexDir="column" p="4" gap="1" w="100%">
        <Flex alignItems="center">
          <Heading size="md">{item.name}</Heading>
          <Heading size="sm" color="gray.400" ml={2}>
            {`Available: ${item.qtyAvailableForApproval >= 0 ? item.qtyAvailableForApproval : 0}`}
          </Heading>
        </Flex>
        <Text>{item.description}</Text>
        <Flex flexDir="row" justifyContent="space-between">
          <NumberInput
            w="48%"
            display="flex"
            flexDir="row"
            min={outOfStock ? 0 : 1}
            max={item.maxRequestQty}
            value={outOfStock ? 0 : requestedNum}
            onChange={e => setRequestedNum(Number(e))}
            isDisabled={outOfStock}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
          <Button
            w="48%"
            colorScheme="twitter"
            disabled={outOfStock}
            onClick={() => {
              const newRequest = {
                item: item.id,
                quantity: requestedNum,
                user: user?.uid as string,
                name: user?.displayName as string,
              };
              mutation.mutate(newRequest);
            }}
          >
            {outOfStock ? "Out of stock" : `Request ${requestedNum} items`}
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default HardwareItem;
