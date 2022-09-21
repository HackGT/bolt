import React, { useEffect, useState } from "react";
import { Grid, Segment } from "semantic-ui-react";
import { connect } from "react-redux";
import axios from "axios";
import { LoadingScreen, useAuth } from "@hex-labs/core";
import { Flex } from "@chakra-ui/react";

import RequestedList from "./RequestedList";
import { User } from "../../types/User";
import { AppState } from "../../state/Store";
import NewHardwareList from "./NewHardwareList";
import { Request } from "../../types/Request";

const HomeContainer: React.FC = props => {
  const [userRequests, setUserRequests] = useState<Request[]>([]);
  const { user, loading } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      const token = await user?.getIdToken();
      console.log(`http://localhost:8007/requests/${user!.uid}`);
      const requests = await axios.get(`http://localhost:8007/requests/${user!.uid}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUserRequests(requests.data);
    };
    if (!loading) {
      fetchData();
    }
  }, [loading]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Flex dir="row" gap={6} p="8">
      <NewHardwareList />
      {user && <RequestedList requests={userRequests} />}
    </Flex>
  );
};

export default HomeContainer;
