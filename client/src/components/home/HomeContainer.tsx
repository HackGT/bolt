import React from "react";
import { apiUrl, ErrorScreen, LoadingScreen, Service, useAuth } from "@hex-labs/core";
import { Flex } from "@chakra-ui/react";
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
    <Flex dir="row" gap={6} p="8" justify="space-around">
      <NewHardwareList />
      {user && <RequestedList requests={data} />}
    </Flex>
  );
};

export default HomeContainer;
