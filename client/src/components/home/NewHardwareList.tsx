import React, { useEffect, useState } from "react";
import { Grid, Loader, Message } from "semantic-ui-react";
import { Link } from "react-router-dom";
import { Box, Button, Center, Flex, Heading, Input, Text } from "@chakra-ui/react";
import { apiUrl, Service, useAuth } from "@hex-labs/core";
import _ from "lodash";
import useAxios from "axios-hooks";

import HardwareLocationContents from "../inventory/HardwareLocationContents";

const NewHardwareList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();

  const [{ data, loading, error }] = useAxios(apiUrl(Service.HARDWARE, "/items"));

  const [{ data: profile, loading: profileLoading, error: profileError }] = useAxios(
    apiUrl(Service.USERS, `/users/${user?.uid}`)
  );
  if (loading || profileLoading) {
    return (
      <>
        <Heading size="huge">Inventory</Heading>
        <Loader active inline="centered" content="Loading items..." />
      </>
    );
  }
  const groupedItems = _.groupBy(data?.items, "location");
  console.log("gr", data)
  const grouped = _.groupBy(data, "location")
  console.log("jaja", grouped)
  // if (error) {
  //   return (
  //     <Flex flexDir="column" w="45%">
  //       <Heading mb="4">Inventory</Heading>
  //       <Alert status="error">
  //         <AlertIcon />
  //         <Box>
  //           <AlertTitle>Error displaying hardware inventory</AlertTitle>
  //           <AlertDescription>
  //             Try refreshing the page. If that doesn't work, contact a member of the HexLabs Team
  //             for assistance.
  //           </AlertDescription>
  //         </Box>
  //       </Alert>
  //     </Flex>
  //   );
  // }

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
    <Flex w="45%" flexDir="column">
      <Heading mb={4}>Inventory</Heading>
      <Flex gap="10px" flexDir="column">
        <Flex flexDir="row" gap={2}>
          {profile.roles.admin ? (
            <Link to="/admin/items/new">
              <Button px={6} colorScheme="twitter" color="white">
                Create item
              </Button>
            </Link>
          ) : (
            ""
          )}
          {noRequestsMessage}
          <Input
            placeholder="Search for item"
            onChange={(e: any) => {
              if (e.target.value.length >= 3) {
                setSearchQuery(e.target.value.trim().toLowerCase());
              } else {
                setSearchQuery("");
              }
            }}
          />
        </Flex>
        {data && Object.keys(data).length > 0 ? (
          Object.keys(_.groupBy(data, "location")).map((location: string) => {
            console.log(location);
            return (
              <HardwareLocationContents
                key={location}
                location={location}
                requestsEnabled={requestsEnabled}
                itemsByLocation={_.groupBy(data.data, "location")[location]}
                searchQuery={searchQuery}
              />
            );
          })
        ) : (
          <Center h="110px">
            <Text fontWeight="semibold">No hardware available right now!</Text>
          </Center>
        )}
      </Flex>
    </Flex>
  );
};

export default NewHardwareList;
