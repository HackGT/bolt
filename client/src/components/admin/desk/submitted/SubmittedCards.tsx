import React, { useState } from "react";
import { Badge, Box, Flex, Heading, Icon, Text } from "@chakra-ui/react";
import {
  DragDropContext,
  Draggable,
  DraggableLocation,
  Droppable,
  DropResult,
} from "react-beautiful-dnd";
import ReactTimeago from "react-timeago";
import { CheckIcon, CloseIcon } from "@chakra-ui/icons";

import { Request } from "../../../../types/Request";
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

const move = (
  source: Request[],
  destination: Request[],
  droppableSource: DraggableLocation,
  droppableDestination: DraggableLocation
) => {
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);
  const [removed] = sourceClone.splice(droppableSource.index, 1);

  destClone.splice(droppableDestination.index, 0, removed);

  const result: Record<string, Request[]> = {};
  result[droppableSource.droppableId] = sourceClone;
  result[droppableDestination.droppableId] = destClone;

  return result;
};

const SubmittedCards = ({ requests }: SubmittedCardsProps) => {
  const [items, setItems] = useState<Record<string, Request[]>>({
    SUBMITTED: [...requests.filter(request => request.status === "SUBMITTED")],
    APPROVED: [...requests.filter(requests => requests.status === "APPROVED")],
    READY_FOR_PICKUP: [...requests.filter(requests => requests.status === "READY_FOR_PICKUP")],
  });

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
              <Flex
                ref={provided.innerRef}
                {...provided.droppableProps}
                flexDir="column"
                w="full"
                minH="256px"
              >
                {items.SUBMITTED.map((request, index) => (
                  <Draggable key={request.id} draggableId={request.id} index={index}>
                    {(provided, snapshot) => (
                      <Flex
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        rounded={8}
                        p={4}
                        shadow="md"
                        minH={32}
                        bgColor="white"
                        gap={1}
                        flexDir="column"
                        mb={4}
                      >
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
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </Flex>
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
              <Flex
                ref={provided.innerRef}
                {...provided.droppableProps}
                flexDir="column"
                w="full"
                minH="256px"
                rounded={4}
              >
                {items.APPROVED.map((request, index) => (
                  <Draggable key={request.id} draggableId={request.id} index={index}>
                    {(provided, snapshot) => (
                      <Flex
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        rounded={8}
                        p={4}
                        shadow="md"
                        minH={32}
                        bgColor="white"
                        gap={1}
                        flexDir="column"
                        mb={4}
                      >
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
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </Flex>
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
              <Flex
                ref={provided.innerRef}
                {...provided.droppableProps}
                flexDir="column"
                w="full"
                minH="256px"
              >
                {items.READY_FOR_PICKUP.map((request, index) => (
                  <Draggable key={request.id} draggableId={request.id} index={index}>
                    {(provided, snapshot) => (
                      <Flex
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        rounded={8}
                        p={4}
                        shadow="md"
                        minH={32}
                        bgColor="white"
                        gap={1}
                        flexDir="column"
                        mb={4}
                      >
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
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </Flex>
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
