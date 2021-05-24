import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import { Button, Grid, Header, Icon, Input, Loader, Message } from "semantic-ui-react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";

import { ALL_ITEMS, GET_SETTING } from "../../graphql/Queries";
import { ItemByLocation } from "../../types/Hardware";
import HardwareLocationContents from "../inventory/HardwareLocationContents";
import { AppState } from "../../state/Store";
import { User } from "../../types/User";

const NewHardwareList = ({ user }: { user: User | null }) => {
  const { data, loading, error } = useQuery(ALL_ITEMS);
  const [searchQuery, setSearchQuery] = useState("");

  const setting = useQuery(GET_SETTING, {
    variables: { settingName: "requests_allowed" },
  });

  if (loading || setting.loading) {
    return (
      <>
        <Header size="huge">Inventory</Header>
        <Loader active inline="centered" content="Loading items..." />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header size="huge">Inventory</Header>
        <Message negative>
          <Message.Header>Error displaying hardware inventory</Message.Header>
          <p>
            Try refreshing the page. If that doesn't work, contact a member of the HackGT Team for
            assistance.
          </p>
        </Message>
      </>
    );
  }

  let requestsEnabled = true;
  if (!setting.error && setting.data.setting !== undefined) {
    requestsEnabled = setting.data.setting.value === "true";
  }

  let noRequestsMessageText = "";
  if (!requestsEnabled) {
    noRequestsMessageText = "Hardware checkout requests can't be made at this time.";
  } else if (requestsEnabled && !user) {
    noRequestsMessageText = "Sign in to request hardware.";
  }

  const noRequestsMessage =
    !requestsEnabled || !user ? (
      <Grid.Row>
        <Grid.Column>
          <Message warning>
            <Message.Header>Look, but do not touch</Message.Header>
            {noRequestsMessageText}
          </Message>
        </Grid.Column>
      </Grid.Row>
    ) : (
      ""
    );

  return (
    <div>
      <Grid columns="equal">
        <Grid.Column>
          <Header size="huge">Inventory</Header>
        </Grid.Column>
        <Grid.Column>
          {user && user.admin ? (
            <Button primary icon labelPosition="left" as={Link} to="/admin/items/new">
              <Icon name="plus circle" />
              Create item
            </Button>
          ) : (
            ""
          )}
        </Grid.Column>
      </Grid>
      <Grid columns="equal">
        {noRequestsMessage}
        <Grid.Row>
          <Grid.Column width={9}>
            <Input
              type="text"
              label="Search items"
              style={{
                marginBottom: 10,
              }}
              onChange={(e: any, { value }: any) => {
                if (value.length >= 3) {
                  setSearchQuery(value.trim().toLowerCase());
                } else {
                  setSearchQuery("");
                }
              }}
            />
          </Grid.Column>
        </Grid.Row>
      </Grid>
      {data.allItems.map((itemsByLocation: ItemByLocation) => (
        <HardwareLocationContents
          key={itemsByLocation.location.id}
          requestsEnabled={requestsEnabled}
          itemsByLocation={itemsByLocation}
          searchQuery={searchQuery}
        />
      ))}
    </div>
  );
};

function mapStateToProps(state: AppState) {
  return {
    user: state.account,
  };
}

export default connect(mapStateToProps)(NewHardwareList);
