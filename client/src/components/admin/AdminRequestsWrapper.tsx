import React, { Component } from "react";
import { connect } from "react-redux";
import { Button, Checkbox, Grid, Header, Loader, Message } from "semantic-ui-react";
import { Query, Mutation } from "@apollo/client/react/components";

import { AppState } from "../../state/Store";
import { GET_SETTING } from "../util/graphql/Queries";
import { UPDATE_SETTING, CREATE_SETTING } from "../util/graphql/Mutations";

class AdminRequestsWrapper extends Component {
  public render() {
    let requests_allowed = false;
    return (
      <div>
        <Header as="h1">Requests</Header>
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
                    {(createSetting: any, { loading, data }: any) => (
                      <Button
                        primary
                        content="Create setting: requests_allowed"
                        onClick={(event, { checked }): any => {
                          createSetting({
                            variables: { newSetting: { name: "requests_allowed", value: "true" } },
                          });
                          requests_allowed = true;
                        }}
                      />
                    )}
                  </Mutation>
                </div>
              );
            }
            if (data.setting !== undefined) {
              requests_allowed = data.setting.value === "true";
            }
            return (
              <Grid stackable>
                <Grid.Row columns={1}>
                  <Grid.Column>
                    <Mutation mutation={UPDATE_SETTING}>
                      {(updateSetting: any, { loading, data }: any) => (
                        <Checkbox
                          toggle
                          checked={requests_allowed}
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
                            requests_allowed = !requests_allowed;
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
  }
}

function mapStateToProps(state: AppState) {
  return {
    user: state.account,
  };
}

export default connect(mapStateToProps)(AdminRequestsWrapper);
