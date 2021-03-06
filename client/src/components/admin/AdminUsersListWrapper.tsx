import React from "react";
import { connect } from "react-redux";
import { Header, Loader, Message } from "semantic-ui-react";
import { Query } from "@apollo/client/react/components";

import { AppState } from "../../state/Store";
import AdminUsersListTable from "./AdminUsersListTable";
import { FullUser } from "../../types/User";
import { ALL_USERS } from "../../graphql/Queries";

const AdminUsersListWrapper: React.FC = () => (
  <div>
    <Header as="h1">Users</Header>
    <Query query={ALL_USERS} fetchPolicy="cache-and-network">
      {({ loading, error, data }: any) => {
        if (loading) {
          return <Loader active inline="centered" content="Just a sec!" />;
        }
        if (error) {
          return (
            <Message
              error
              visible
              header="Can't fetch users"
              content={`Hmm, an error is preventing us from displaying the list of users.  The error was: ${error.message}`}
            />
          );
        }
        const { users }: { users: FullUser[] } = data;

        return <AdminUsersListTable users={users} />;
      }}
    </Query>
  </div>
);

function mapStateToProps(state: AppState) {
  return {
    user: state.account,
  };
}

export default connect(mapStateToProps)(AdminUsersListWrapper);
