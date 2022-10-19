import { Container, Flex, FormControl, Heading, Select } from "@chakra-ui/react";
import { apiUrl, LoadingScreen, Service } from "@hex-labs/core";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import React, { useEffect } from "react";

const EditRequest = () => {
  //   const userQuery = useQuery(["users"], () => axios.get(apiUrl(Service.USERS, `/users/${}`)));

  const itemQuery = useQuery(["items"], () => axios.get("/items"));

  if (itemQuery.isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Container maxW="container.md">
      <Heading>Edit Request</Heading>
      <FormControl>
        <Select>
          <option>Edmund</option>
        </Select>
      </FormControl>
    </Container>
  );
};

export default EditRequest;
