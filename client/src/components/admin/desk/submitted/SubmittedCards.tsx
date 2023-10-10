import React, { useState } from "react";
import { Badge, Box, Flex, Heading, Icon, IconButton, Text } from "@chakra-ui/react";
import {
  DragDropContext,
  Draggable,
  DraggableLocation,
  Droppable,
  DropResult,
} from "react-beautiful-dnd";
import ReactTimeago from "react-timeago";
import { CheckIcon, CloseIcon, DeleteIcon } from "@chakra-ui/icons";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { apiUrl, Service } from "@hex-labs/core";

import { Request, RequestStatus } from "../../../../types/Request";
import SubmittedCard from "./SubmittedCard";
import { APPROVED, READY_FOR_PICKUP, SUBMITTED } from "../../../../types/Hardware";
import { generateBadge } from "./SubmittedTable";

interface SubmittedCardsProps {
  requests: Request[];
}

const reorder = (list: Request[], startIndex: number, endIndex: number) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const SubmittedCards = ({ requests }: SubmittedCardsProps) => {
  const [items, setItems] = useState<Record<string, Request[]>>({
    SUBMITTED: [...requests.filter(request => request.status === "SUBMITTED")],
    APPROVED: [...requests.filter(request => request.status === "APPROVED")],
    READY_FOR_PICKUP: [...requests.filter(request => request.status === "READY_FOR_PICKUP")],
  });

  const updateStatus = useMutation((newRequest: any) =>
    axios.patch(apiUrl(Service.HARDWARE, `/hardware-requests/${newRequest.id}`), newRequest)
  );

  const move = (
    source: Request[],
    destination: Request[],
    droppableSource: DraggableLocation,
    droppableDestination: DraggableLocation
  ) => {
    const sourceClone = Array.from(source);
    const destClone = Array.from(destination);
    const [removed] = sourceClone.splice(droppableSource.index, 1);
    removed.status = droppableDestination.droppableId as RequestStatus;
    updateStatus.mutate({
      id: removed.id,
      status: droppableDestination.droppableId as RequestStatus,
    });

    destClone.splice(droppableDestination.index, 0, removed);

    const result: Record<string, Request[]> = {};
    result[droppableSource.droppableId] = sourceClone;
    result[droppableDestination.droppableId] = destClone;

    return result;
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) {
      return;
    }

    const sInd = source.droppableId;
    const dInd = destination.droppableId;

    if (sInd === dInd) {
      const result = reorder(items[sInd], source.index, destination.index);
      const newItems = { ...items };
      newItems[sInd] = result;
      setItems(newItems);
    } else {
      const result = move(items[sInd], items[dInd], source, destination);
      const newItems = { ...items };
      newItems[sInd] = result[sInd];
      newItems[dInd] = result[dInd];

      setItems(newItems);
    }
  };

  const noIssues = (
    <Flex align="center" gap={2}>
      <CheckIcon color="green" /> <Text color="green">No issues found</Text>
    </Flex>
  );

  function noStockWarning(remaining: number) {
    return (
      <Flex align="center" gap={2}>
        <CloseIcon color="red" />
        <Text color="red">{`Insufficient stock (${remaining} available for approval)`}</Text>
      </Flex>
    );
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Flex gap={4}>
        <Box w="full" bgColor="gray.100" p={4} rounded={8} h="fit-content">
          <Flex gap={2} alignContent="center">
            <Heading mb={2} size="md">
              Submitted
            </Heading>
            <Box rounded="5px" bg="gray.300" py="1px" h="fit-content" px="5px">
              <Text fontWeight={700}>{items.SUBMITTED.length}</Text>
            </Box>
          </Flex>
          <Droppable droppableId={SUBMITTED}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                style={{ flexDirection: "column", width: "100%", minHeight: "256px" }}
              >
                {items.SUBMITTED.map((request, index) => (
                  <Draggable key={request.id} draggableId={request.id.toString()} index={index}>
                    {(provided, snapshot) => (
                      <SubmittedCard provided={provided} request={request} />
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </Box>
        <Box w="full" bg="gray.100" p={4} rounded={8} h="fit-content">
          <Flex gap={2} alignContent="center">
            <Heading mb={2} size="md">
              Approved
            </Heading>
            <Box rounded="5px" bg="gray.300" py="1px" h="fit-content" px="5px">
              <Text fontWeight={700}>{items.APPROVED.length}</Text>
            </Box>
          </Flex>
          <Droppable droppableId={APPROVED}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                style={{
                  flexDirection: "column",
                  width: "100%",
                  minHeight: "256px",
                  borderRadius: "4px",
                }}
              >
                {items.APPROVED.map((request, index) => (
                  <Draggable key={request.id} draggableId={request.id.toString()} index={index}>
                    {(provided, snapshot) => (
                      <SubmittedCard provided={provided} request={request} />
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </Box>
        <Box w="full" p={4} rounded={8} bgColor="gray.100" h="fit-content">
          <Flex gap={2} alignContent="center">
            <Heading mb={2} size="md">
              Ready for Pickup
            </Heading>
            <Box rounded="5px" bg="gray.300" py="1px" h="fit-content" px="5px">
              <Text fontWeight={700}>{items.READY_FOR_PICKUP.length}</Text>
            </Box>
          </Flex>
          <Droppable droppableId={READY_FOR_PICKUP}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                style={{ flexDirection: "column", width: "100%", minHeight: "256px" }}
              >
                {items.READY_FOR_PICKUP.map((request, index) => (
                  <Draggable key={request.id} draggableId={request.id.toString()} index={index}>
                    {(provided, snapshot) => (
                      <SubmittedCard provided={provided} request={request} />
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </Box>
      </Flex>
      {/* <SubmittedCard request={requests[0]} /> */}
      {/* <Flex>
        <Flex flexDir="column">
        </Flex>
        <Flex flexDir="column">
          <SubmittedCard request={requests[0]} />
        </Flex>
        <Flex flexDir="column">
          <SubmittedCard request={requests[0]} />
        </Flex>
      </Flex> */}
    </DragDropContext>
  );
};

export default SubmittedCards;
