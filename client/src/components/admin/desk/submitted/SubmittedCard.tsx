import React from "react";
import { Button, Card, Header, Icon, Label, Popup } from "semantic-ui-react";
import { Box, Flex, Heading, IconButton, Text, Tooltip, useToast } from "@chakra-ui/react";
import ReactTimeago from "react-timeago";
import { DraggableProvided } from "react-beautiful-dnd";
import { CheckIcon, DeleteIcon } from "@chakra-ui/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { apiUrl, LoadingScreen, Service } from "@hex-labs/core";

import { generateBadge } from "./SubmittedTable";
import { Request } from "../../../../types/Request";

interface SubmittedCardProps {
  provided: DraggableProvided;
  request: Request;
}

function noStockWarning(remaining: number) {
  return (
    <Card.Content className="hw-negative">
      <Icon name="wrench" />
      {`Insufficient stock (${remaining} available for approval)`}
    </Card.Content>
  );
}

const noIssues = (
  <Flex align="center" gap={2}>
    <CheckIcon color="green" /> <Text color="green">No issues found</Text>
  </Flex>
);

const SubmittedCard = ({ provided, request }: SubmittedCardProps) => {
  const toast = useToast();
  const requestDeleteMutation = useMutation(
    (requestId: string) =>
      axios.delete(apiUrl(Service.HARDWARE, `/hardware-requests/${requestId}`)),
    {
      onSuccess: () => {
        toast({
          title: "Request deleted",
          description: "The request has been deleted!",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      },
    }
  );

  console.log(request.user)

  return (
    <Flex
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      rounded={8}
      p={4}
      shadow="md"
      minH={32}
      bgColor="white"
      mb={4}
      justify="space-between"
      alignItems="center"
    >
      <Flex gap={1} flexDir="column">
        <Heading size="lg">{`${request.user.name}`}</Heading>
        <Flex gap={2}>
          <Heading as="h4" size="md">
            {request.item.name}
          </Heading>
          <Text color="gray.500">{`Qty: ${request.quantity}`}</Text>
        </Flex>
        <Text color="gray.500">{request.item.description}</Text>
        {request.item.totalAvailable >= request.quantity
          ? noIssues
          : noStockWarning(request.item.totalAvailable)}
        <ReactTimeago date={request.createdAt} />
        <Box>{generateBadge(request.status)}</Box>
      </Flex>
      <Tooltip label="Delete Request">
        <IconButton
          aria-label="delete"
          icon={<DeleteIcon />}
          color="red.400"
          variant="ghost"
          onClick={() => requestDeleteMutation.mutate(request.id)}
        />
      </Tooltip>
    </Flex>
  );
};

export default SubmittedCard;
