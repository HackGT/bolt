import React from "react";
import { apiUrl, ErrorScreen, LoadingScreen, Service, useAuth } from "@hex-labs/core";
import { Box, Flex, Container } from "@chakra-ui/react";
import { Navigate } from "react-router-dom";
import useAxios from "axios-hooks";

import RequestedList from "./RequestedList";
import NewHardwareList from "./NewHardwareList";

const HomeContainer: React.FC = props => {
  const { user } = useAuth();

  const [{ data, loading, error }] = useAxios(
    apiUrl(Service.HARDWARE, `/hardware-requests?userId=${user?.uid}`)
  );

  if (!user) {
    return <Navigate to="/" />;
  }

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen error={error} />;
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Flex direction={{ base: "column", lg: "row" }} gap={8} align="flex-start">
        <Box flex={{ base: "1", lg: "3" }} w="100%">
          <NewHardwareList />
        </Box>
        {user && (
          <Box flex={{ base: "1", lg: "2" }} w="100%" maxW={{ lg: "400px" }}>
            <RequestedList requests={data} />
          </Box>
        )}
      </Flex>
    </Container>
  );
};

export default HomeContainer;
