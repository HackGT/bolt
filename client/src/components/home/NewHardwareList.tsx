import React, { useEffect, useState } from "react";
import { useQuery } from "@apollo/client";
import { Grid, Icon, Loader, Message } from "semantic-ui-react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Text,
} from "@chakra-ui/react";
import { useAuth } from "@hex-labs/core";
import useAxios from "axios-hooks";
import axios from "axios";
import _ from "lodash";

import { ALL_ITEMS, GET_SETTING } from "../../graphql/Queries";
import { Item, ItemByLocation } from "../../types/Hardware";
import HardwareLocationContents from "../inventory/HardwareLocationContents";

const NewHardwareList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { user, loading } = useAuth();
  const [itemListingsByLocation, setItemListingsByLocation] = useState<Record<string, Item[]>>();

  useEffect(() => {
    const fetchData = async () => {
      const token = await user?.getIdToken();
      const requests = await axios.get(`http://localhost:8007/items/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const groupedItems = _.groupBy(requests.data, "location.name");
      setItemListingsByLocation(groupedItems);
    };
    if (!loading) {
      fetchData();
    }
  }, [loading]);

  if (loading) {
    return (
      <>
        <Heading size="huge">Inventory</Heading>
        <Loader active inline="centered" content="Loading items..." />
      </>
    );
  }

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
          {user ? (
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
        {itemListingsByLocation ? (
          Object.keys(itemListingsByLocation).map((location: string) => {
            console.log(itemListingsByLocation[location]);
            return (
              <HardwareLocationContents
                key={location}
                location={location}
                requestsEnabled={requestsEnabled}
                itemsByLocation={itemListingsByLocation[location]}
                searchQuery={searchQuery}
              />
            );
          })
        ) : (
          <Box>
            <Text>No hardware available right now!</Text>
          </Box>
        )}
      </Flex>
    </Flex>
  );
};

export default NewHardwareList;
