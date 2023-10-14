import React, { useState } from "react";
import { Badge, Box, Flex, Heading, Icon, IconButton, Text, useDisclosure } from "@chakra-ui/react";
import {
  DragDropContext,
  Draggable,
  DraggableLocation,
  Droppable,
  DropResult,
} from "react-beautiful-dnd";
import { CheckIcon, CloseIcon } from "@chakra-ui/icons";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { apiUrl, Service } from "@hex-labs/core";

import { Request, RequestStatus } from "../../../../types/Request";
import SubmittedCard from "./SubmittedCard";
import {
  APPROVED,
  DENIED,
  FULFILLED,
  READY_FOR_PICKUP,
  RETURNED,
  SUBMITTED,
} from "../../../../types/Hardware";

interface SubmittedCardsProps {
  requests: Request[];
  refetch: any;
}

const reorder = (list: Request[], startIndex: number, endIndex: number) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const SubmittedCards = ({ requests, refetch }: SubmittedCardsProps) => {
  const [items, setItems] = useState<Record<string, Request[]>>({
    SUBMITTED: [...requests.filter(request => request.status === "SUBMITTED")],
    DENIED: [...requests.filter(request => request.status === "DENIED")],
    READY_FOR_PICKUP: [...requests.filter(request => request.status === "READY_FOR_PICKUP")],
    FULFILLED: [...requests.filter(request => request.status === "FULFILLED")],
    RETURNED: [...requests.filter(request => request.status === "RETURNED")],
  });

  const [removedItem, setRemovedItem] = useState<Request>();

  const updateStatus = useMutation(
    async (newRequest: any) =>
      await axios.put(apiUrl(Service.HARDWARE, `/hardware-requests/${newRequest.id}`), newRequest)
  );

  const updateQuantity = useMutation(
    async ({ id, updatedItem }: any) =>
      await axios.put(apiUrl(Service.HARDWARE, `/items/${id}`), updatedItem)
  );

  const updateItem = async (id: string, body: any) => {
    await axios.put(apiUrl(Service.HARDWARE, `/items/${id}`), body);
  };

  const { isOpen, onOpen, onClose } = useDisclosure();

  const move = async (
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

    console.log(droppableSource.droppableId);
    console.log(droppableDestination.droppableId);

    await updateItem(removed.item.id, {
      name: removed.item.name,
      category: removed.item.category,
      location: removed.item.location,
      totalAvailable: () => {
        if (droppableDestination.droppableId === READY_FOR_PICKUP) {
          return removed.item.totalAvailable - removed.quantity;
        }
        if (droppableSource.droppableId === READY_FOR_PICKUP) {
          return removed.item.totalAvailable + removed.quantity;
        }
        return removed.item.totalAvailable;
      },

      maxRequestQty: removed.item.maxRequestQty,
    });

    console.log(removed.item.totalAvailable);

    destClone.splice(droppableDestination.index, 0, removed);

    const result: Record<string, Request[]> = {};
    result[droppableSource.droppableId] = sourceClone;
    result[droppableDestination.droppableId] = destClone;

    return result;
  };

  const onDragEnd = async (result: DropResult) => {
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
      const result = await move(items[sInd], items[dInd], source, destination);
      const newItems = { ...items };
      newItems[sInd] = result[sInd];
      newItems[dInd] = result[dInd];

      setItems(newItems);

      if (dInd === "FULFILLED" || dInd === "RETURNED") {
        onOpen();
        if (dInd === "RETURNED" && removedItem !== undefined && isOpen) {
          await axios.put(apiUrl(Service.HARDWARE, `/items/${removedItem.item.id}`), {
            ...removedItem.item,
          });
          setRemovedItem(undefined);
        }
      }

      if (dInd === "READY_FOR_PICKUP" && removedItem !== undefined) {
        await axios.put(apiUrl(Service.HARDWARE, `/items/${removedItem.item.id}`), {
          name: removedItem.item.name,
          category: removedItem.item.category,
          location: removedItem.item.location,
          totalAvailable: removedItem.item.totalAvailable - removedItem.quantity,
          maxRequestQty: removedItem.item.maxRequestQty,
        });
        setRemovedItem(undefined);
      }
      refetch();
    }
  };

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
                      <SubmittedCard
                        provided={provided}
                        request={request}
                        isOpen={isOpen}
                        onOpen={onOpen}
                        onClose={onClose}
                      />
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
                      <SubmittedCard
                        provided={provided}
                        request={request}
                        isOpen={isOpen}
                        onOpen={onOpen}
                        onClose={onClose}
                      />
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
              Denied
            </Heading>
            <Box rounded="5px" bg="gray.300" py="1px" h="fit-content" px="5px">
              <Text fontWeight={700}>{items.DENIED.length}</Text>
            </Box>
          </Flex>
          <Droppable droppableId={DENIED}>
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
                {items.DENIED.map((request, index) => (
                  <Draggable key={request.id} draggableId={request.id.toString()} index={index}>
                    {(provided, snapshot) => (
                      <SubmittedCard
                        provided={provided}
                        request={request}
                        isOpen={isOpen}
                        onOpen={onOpen}
                        onClose={onClose}
                      />
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
              Fulfilled
            </Heading>
            <Box rounded="5px" bg="gray.300" py="1px" h="fit-content" px="5px">
              <Text fontWeight={700}>{items.FULFILLED.length}</Text>
            </Box>
          </Flex>
          <Droppable droppableId={FULFILLED}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                style={{ flexDirection: "column", width: "100%", minHeight: "256px" }}
              >
                {items.FULFILLED.map((request, index) => (
                  <Draggable key={request.id} draggableId={request.id.toString()} index={index}>
                    {(provided, snapshot) => (
                      <SubmittedCard
                        provided={provided}
                        request={request}
                        isOpen={isOpen}
                        onOpen={onOpen}
                        onClose={onClose}
                      />
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
              Returned
            </Heading>
            <Box rounded="5px" bg="gray.300" py="1px" h="fit-content" px="5px">
              <Text fontWeight={700}>{items.RETURNED.length}</Text>
            </Box>
          </Flex>
          <Droppable droppableId={RETURNED}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                style={{ flexDirection: "column", width: "100%", minHeight: "256px" }}
              >
                {items.RETURNED.map((request, index) => (
                  <Draggable key={request.id} draggableId={request.id.toString()} index={index}>
                    {(provided, snapshot) => (
                      <SubmittedCard
                        provided={provided}
                        request={request}
                        isOpen={isOpen}
                        onOpen={onOpen}
                        onClose={onClose}
                      />
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </Box>
      </Flex>
    </DragDropContext>
  );
};

export default SubmittedCards;
