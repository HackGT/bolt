import { Box, Button, Flex, Heading, Image, Tag, Text } from "@chakra-ui/react";
import { apiUrl, Service } from "@hex-labs/core";
import { MutationKey, useMutation } from "@tanstack/react-query";
import axios, { AxiosResponse } from "axios";
import React from "react";
import { Container, Item as SMItem, Label } from "semantic-ui-react";

import { Item } from "../../../types/Hardware";

interface ReviewCardProps {
  item: Item;
}

const ReviewCard = (props: ReviewCardProps) => {
  const { item } = props;
  const {
    name,
    description,
    totalAvailable,
    maxRequestQty,
    imageUrl,
    category,
    price,
    owner,
    approvalRequired,
    returnRequired,
    hidden,
    location,
  } = item;
  return (
    <Flex gap={4} alignItems="center">
      <Image boxSize="120px" src={imageUrl} />
      <SMItem.Content>
        <Heading size="md">{name}</Heading>
        <Text color="gray.500">
          {`Request up to ${maxRequestQty} at a time | ${totalAvailable} available, Location: ${location}
          , Owner: ${owner}, Unit Cost: ${price}`}
        </Text>
        <Flex gap={2} mb={2}>
          <Tag>{`Category: ${category}`}</Tag>
          {hidden ? <Tag colorScheme="red">Hidden</Tag> : null}
          {!approvalRequired ? <Tag colorScheme="red">No Approval Required</Tag> : null}
          {!returnRequired ? <Tag colorScheme="red">No Return Required</Tag> : null}
        </Flex>
        <Text>{description}</Text>
      </SMItem.Content>
    </Flex>
  );
};

interface ReviewSetupProps {
  inventory: Item[];
  setStep: (step: number) => any;
}

const ReviewSetup = (props: ReviewSetupProps) => {
  const { inventory, setStep } = props;

  const inventoryMutation = useMutation((newItem: Item): any =>
    axios.post(apiUrl(Service.HARDWARE, "/items"), newItem)
  );

  const submitInventory = () => {
    inventory.map(item => inventoryMutation.mutate(item));
  };

  return (
    <Container>
      <Flex my="20px" maxW="fit-content" mx="auto" gap={2}>
        <Button variant="ghost" colorScheme="blue" onClick={() => setStep(0)}>
          Previous
        </Button>
        <Button
          colorScheme="whatsapp"
          onClick={() => submitInventory()}
          isLoading={inventoryMutation.isLoading}
        >
          Submit
        </Button>
      </Flex>
      <Flex flexDir="column" gap={8}>
        {inventory.map(item => (
          <ReviewCard key={item.name} item={item} />
        ))}
      </Flex>
    </Container>
  );
};

export default ReviewSetup;
