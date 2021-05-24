import React, { useState } from "react";
import { connect } from "react-redux";
import { Button, Checkbox, Grid, Header, Loader, Message } from "semantic-ui-react";
import { Query, Mutation } from "@apollo/client/react/components";

import { AppState } from "../../state/Store";
import { GET_SETTING } from "../util/graphql/Queries";
import { UPDATE_SETTING, CREATE_SETTING } from "../util/graphql/Mutations";

const AdminRequestSettingsWrapper: React.FC = () => {
  const [requestsAllowed, setRequestsAllowed] = useState(false);

  return (
    <div>
      <Header as="h1">Settings</Header>
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
                  <Mutation mutation={UPDATE_SETTING}>
                    {(updateSetting: any) => (
                      <Checkbox
                        toggle
                        checked={requestsAllowed}
                        label="Requests allowed"
                        onChange={(event, { checked }): any => {
                          updateSetting({
                            variables: {
                              settingName: "requests_allowed",
                              updatedSetting: {
                                name: "requests_allowed",
                                value: checked ? "true" : "false",
                              },
                            },
                          });
                          setRequestsAllowed(!requestsAllowed);
                        }}
                      />
                    )}
                  </Mutation>
                </Grid.Column>
              </Grid.Row>
            </Grid>
          );
        }}
      </Query>
    </div>
  );
};

function mapStateToProps(state: AppState) {
  return {
    user: state.account,
  };
}

export default connect(mapStateToProps)(AdminRequestSettingsWrapper);
