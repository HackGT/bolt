import React, { useEffect, useState } from "react";
import { Grid, Loader, Message } from "semantic-ui-react";
import { Link } from "react-router-dom";
import { Box, Button, Center, Flex, Heading, Input, Text, Image } from "@chakra-ui/react";
import { apiUrl, ErrorScreen, LoadingScreen, Service, useAuth } from "@hex-labs/core";
import _ from "lodash";
import useAxios from "axios-hooks";

import { Category, Item } from "../../types/Hardware";

import HardwareLocationContents from "../inventory/HardwareLocationContents";

// Add this new component for the placeholder image
const ImagePlaceholder = () => (
  <Box
    width="100%"
    height="100%"
    borderWidth="1px"
    borderColor="gray.200"
    borderStyle="dashed"
    borderRadius="md"
    bg="white"
  />
);

// Modify the HardwareItem component to use the placeholder
const HardwareItem = ({ item }: { item: Item }) => (
  <Box borderWidth="1px" borderRadius="lg" overflow="hidden" p={4}>
    <Flex direction="column" align="center">
      {item.imageUrl ? (
        <Image src={item.imageUrl} alt={item.name} boxSize="100px" objectFit="cover" />
      ) : (
        <Box boxSize="100px">
          <ImagePlaceholder />
        </Box>
      )}
      <Text mt={2} fontWeight="bold">
        {item.name}
      </Text>
      <Text>Quantity: {item.quantity}</Text>
    </Flex>
  </Box>
);

const NewHardwareList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();

  const [{ data, loading, error }] = useAxios(apiUrl(Service.HARDWARE, "/items"));

  const [{ data: profile, loading: profileLoading, error: profileError }] = useAxios(
    apiUrl(Service.USERS, `/users/${user?.uid}`)
  );

  if (error || profileError) {
    return <ErrorScreen error={(error || profileError) as Error} />;
  }

  if (loading || profileLoading) {
    return <LoadingScreen />;
  }

  // TODO: Use the settings to determine if requests are enabled
  const requestsEnabled = true;
  // if (!setting.error && setting.data.setting !== undefined) {
  //   requestsEnabled = setting.data.setting.value === "true";
  // }

  let noRequestsMessageText = "";
  if (!requestsEnabled) {
    noRequestsMessageText = "Hardware checkout requests can't be made at this time.";
  } else if (requestsEnabled && !user) {
    noRequestsMessageText = "Sign in to request hardware.";
  }

  const noRequestsMessage =
    !requestsEnabled || !user ? (
      <Grid.Row>
        <Grid.Column>
          <Message warning>
            <Message.Header>Look, but do not touch</Message.Header>
            {noRequestsMessageText}
          </Message>
        </Grid.Column>
      </Grid.Row>
    ) : (
      ""
    );

  return (
    <Box>
      <Heading mb={4}>Inventory</Heading>
      <Flex direction="column" gap={4}>
        <Flex wrap="wrap" gap={2}>
          {profile.roles.admin && (
            <Link to="/admin/categories/new">
              <Button colorScheme="twitter" color="white">
                Create category
              </Button>
            </Link>
          )}
          {profile.roles.admin && (
            <Link to="/admin/items/new">
              <Button colorScheme="twitter" color="white">
                Create item
              </Button>
            </Link>
          )}
          {noRequestsMessage}
        </Flex>
        <Input
          placeholder="Search for item"
          onChange={(e: any) => {
            if (e.target.value.length > 1) {
              setSearchQuery(e.target.value.trim().toLowerCase());
            } else {
              setSearchQuery("");
            }
          }}
        />
        {data && data.length > 0 ? (
          data?.map((locGroup: any) => {
            const locationname = locGroup.location.name;
            return (
              <Box key={locationname}>
                <Heading size="md" mb={2}>
                  {locationname}
                </Heading>
                <Grid templateColumns="repeat(auto-fill, minmax(200px, 1fr))" gap={4}>
                  {locGroup.categories
                    .flatMap((category: Category) => category.items)
                    .filter((item: Item) =>
                      item.name.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((item: Item) => (
                      <HardwareItem key={item.id} item={item} />
                    ))}
                </Grid>
              </Box>
            );
          })
        ) : (
          <Center h="110px">
            <Text fontWeight="semibold">No hardware available right now!</Text>
          </Center>
        )}
      </Flex>
    </Box>
  );
};

export default NewHardwareList;
