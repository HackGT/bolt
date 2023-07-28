import React from "react";
import { apiUrl, LoadingScreen, Service, useAuth } from "@hex-labs/core";
import { Flex } from "@chakra-ui/react";
import { Navigate } from "react-router-dom";
import useAxios from "axios-hooks";

import RequestedList from "./RequestedList";
import NewHardwareList from "./NewHardwareList";

const HomeContainer: React.FC = props => {
  const { user } = useAuth();

  console.log(user);

  const [{ data, loading, error }] = useAxios(
    apiUrl(Service.HARDWARE, `/hardware-requests?userId=${user?.uid}`)
  );

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/" />;
  }

  return (
    <Flex dir="row" gap={6} p="8" justify="space-around">
      <NewHardwareList />
      {user && <RequestedList requests={data} />}
    </Flex>
  );
};

export default HomeContainer;
