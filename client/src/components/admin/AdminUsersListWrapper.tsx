import React from "react";
import { connect } from "react-redux";
import { Header, Loader, Message } from "semantic-ui-react";
import { Query } from "@apollo/client/react/components";
import { Container, Heading } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { apiUrl, LoadingScreen, Service } from "@hex-labs/core";

import { AppState } from "../../state/Store";
import AdminUsersListTable from "./AdminUsersListTable";
import { FullUser } from "../../types/User";
import { ALL_USERS } from "../../graphql/Queries";

const AdminUsersListWrapper: React.FC = () => {
  const { data, isLoading } = useQuery(["users"], () => axios.get(apiUrl(Service.USERS, "/users")));
  const { data: permissionsData, isLoading: permissionsIsLoading } = useQuery(["permissions"], () =>
    axios.get(apiUrl(Service.AUTH, "/permissions/actions/retrieve"))
  );

  if (isLoading || permissionsIsLoading) {
    return <LoadingScreen />;
  }

  return (
    <Container maxW="container.lg">
      <Heading size="xl">Users</Heading>
      <AdminUsersListTable users={data?.data.profiles} permissions={permissionsData?.data} />;
    </Container>
  );
};

export default AdminUsersListWrapper;
