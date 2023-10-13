import React, { useEffect, useState } from "react";
import { Grid } from "semantic-ui-react";
import { Container, FormControl, FormLabel, Heading, Switch } from "@chakra-ui/react";
import { apiUrl, LoadingScreen, Service } from "@hex-labs/core";
import useAxios from "axios-hooks";
import axios from "axios";

const AdminRequestSettingsWrapper: React.FC = () => {
  const [requestsAllowed, setRequestsAllowed] = useState(false);
  const [{ data: hardwareSetting, loading, error }] = useAxios(
    apiUrl(Service.HARDWARE, "/hardware-settings")
  );

  useEffect(() => {
    if (hardwareSetting) {
      setRequestsAllowed(hardwareSetting.isHardwareRequestsAllowed);
    }
  }, [hardwareSetting]);

  if (loading) {
    return <LoadingScreen />;
  }

  const updateSettings = () => {
    setRequestsAllowed(!requestsAllowed);
    axios.post(apiUrl(Service.HARDWARE, "/hardware-settings"), {
      isHardwareRequestsAllowed: !hardwareSetting.isHardwareRequestsAllowed,
    });
  };

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
              <Switch id="email-alerts" isChecked={requestsAllowed} onChange={updateSettings} />
            </FormControl>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Container>
  );
};

export default AdminRequestSettingsWrapper;
