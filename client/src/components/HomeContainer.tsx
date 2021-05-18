import React from "react";
import { Grid, Segment } from "semantic-ui-react";
import { connect } from "react-redux";

import RequestedList from "./requests/RequestedList";
import { User } from "../types/User";
import { AppState } from "../state/Store";
import NewHardwareList from "./inventory/NewHardwareList";

interface OwnProps {}

interface StateProps {
  user: User | null;
}

type Props = (StateProps & OwnProps) | any;

const HomeContainer: React.FC<Props> = props => {
  const myRequests = props.user ? (
    <Grid.Column>
      <h1>My Requests</h1>
      <Segment placeholder>
        <RequestedList user={props.user} />
      </Segment>
    </Grid.Column>
  ) : (
    ""
  );

  return (
    <Grid stackable columns={2} style={{ maxWidth: "960px" }}>
      <Grid.Row>
        <Grid.Column>
          <NewHardwareList />
        </Grid.Column>
        {myRequests}
      </Grid.Row>
    </Grid>
  );
};

function mapStateToProps(state: AppState) {
  return {
    user: state.account,
  };
}

export default connect(mapStateToProps)(HomeContainer);
