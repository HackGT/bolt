import React, { useEffect, useState } from "react";
import { Grid, Segment } from "semantic-ui-react";
import { connect } from "react-redux";
import axios from "axios";
import { apiUrl, LoadingScreen, Service, useAuth } from "@hex-labs/core";
import { Container, Flex } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";

import RequestedList from "./RequestedList";
import { User } from "../../types/User";
import { AppState } from "../../state/Store";
import NewHardwareList from "./NewHardwareList";
import { Request } from "../../types/Request";

const HomeContainer: React.FC = props => {
  const [userRequests, setUserRequests] = useState<Request[]>([]);
  const { user, loading } = useAuth();

  const requestQuery = useQuery(["requests"], async () => {
    const requests = await axios.get(apiUrl(Service.HARDWARE, "/hardware-requests"));
    return requests.data;
  });

  useEffect(() => {
    const fetchData = async () => {
      const requests = await axios.get(apiUrl(Service.HARDWARE, `/hardware-requests/${user!.uid}`));
      setUserRequests(requests.data);
    };
    if (!loading) {
      fetchData();
    }
  }, [loading]);

  if (loading || requestQuery.isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/" />;
  }

  return (
    <Flex dir="row" gap={6} p="8" justify="space-around">
      <NewHardwareList />
      {user && <RequestedList requests={requestQuery.data} />}
    </Flex>
  );
};

export default HomeContainer;
