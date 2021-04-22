import React from "react";
import { Button, Header, Icon, Message, Segment } from "semantic-ui-react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";

import { AppState } from "../../state/Store";

const NoItemsFound = ({ searchQuery, user }: any) => {
  if (!searchQuery) {
    return (
      <Message style={{ marginTop: 10 }}>
        <Message.Header>No items here!</Message.Header>
        <p>
          This location doesn't have any items you can see. Try again later, or contact a HackGT
          staff member for further assistance.
        </p>
        {user && user.admin && (
          <>
            <Button primary as={Link} to="/admin/items/new">
              Create item
            </Button>
            <Button as={Link} to="/admin/csv">
              Import items
            </Button>
          </>
        )}
      </Message>
    );
  }

  return (
    <Segment placeholder textAlign="center" style={{ marginTop: 10 }}>
      <Header icon>
        <Icon name="frown outline" />
        No matching items were found
      </Header>
      If you're trying to find something specific, you can ask a staff member at the HackGT hardware
      desk staff for help!
    </Segment>
  );
};

function mapStateToProps(state: AppState) {
  return {
    user: state.account,
  };
}

export default connect(mapStateToProps)(NoItemsFound);
