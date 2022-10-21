import React, { useState } from "react";
import { connect } from "react-redux";
import { Button, Checkbox, Grid, Header, Loader, Message } from "semantic-ui-react";
import { Query, Mutation } from "@apollo/client/react/components";
import { Container, FormControl, FormLabel, Heading, Switch } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";

import { AppState } from "../../state/Store";
import { GET_SETTING } from "../../graphql/Queries";
import { UPDATE_SETTING, CREATE_SETTING } from "../../graphql/Mutations";

const AdminRequestSettingsWrapper: React.FC = () => {
  const [requestsAllowed, setRequestsAllowed] = useState(false);

  const { data, isLoading } = useQuery(["settings"]);

  return (
    <Container maxW="container.lg">
      <Heading size="xl">Settings</Heading>
      <Query query={GET_SETTING} variables={{ settingName: "requests_allowed" }}>
        {({ loading, error, data }: any) => {
          if (loading) {
            return <Loader active inline="centered" content="Just a sec!" />;
          }
          if (error) {
            return (
              <div>
                <Message
                  error
                  visible
                  header="Can't load request settings"
                  content={`Hmm, an error is preventing us from displaying the request settings.  The error was: ${error.message}`}
                />
                <Mutation mutation={CREATE_SETTING}>
                  {(createSetting: any) => (
                    <Button
                      primary
                      content="Create setting: requests_allowed"
                      onClick={() => {
                        createSetting({
                          variables: { newSetting: { name: "requests_allowed", value: "true" } },
                        });
                        setRequestsAllowed(true);
                      }}
                    />
                  )}
                </Mutation>
              </div>
            );
          }
          if (data.setting !== undefined) {
            setRequestsAllowed(data.setting.value === "true");
          }
          return (
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
          );
        }}
      </Query>
    </Container>
  );
};

export default AdminRequestSettingsWrapper;
