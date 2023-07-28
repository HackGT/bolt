import React, { useState } from "react";
import { Grid } from "semantic-ui-react";
import { Container, FormControl, FormLabel, Heading, Switch } from "@chakra-ui/react";
import { apiUrl, LoadingScreen, Service } from "@hex-labs/core";
import useAxios from "axios-hooks";

const AdminRequestSettingsWrapper: React.FC = () => {
  const [requestsAllowed, setRequestsAllowed] = useState(false);

  const [{ data, loading, error }] = useAxios(apiUrl(Service.HARDWARE, "/items"));

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Container maxW="container.lg">
      <Heading size="xl">Settings</Heading>
      <Grid stackable>
        <Grid.Row columns={1}>
          <Grid.Column>
            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="email-alerts" mb="0">
                Enable requests?
              </FormLabel>
              <Switch
                id="email-alerts"
                isChecked={requestsAllowed}
                onChange={e => {
                  setRequestsAllowed(e.target.value === "true");
                }}
              />
            </FormControl>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Container>
  );
};

export default AdminRequestSettingsWrapper;
