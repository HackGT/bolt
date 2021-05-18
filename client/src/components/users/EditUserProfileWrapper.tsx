import React from "react";
import { match } from "react-router";
import { Query } from "@apollo/client/react/components";
import { Header, Loader, Message } from "semantic-ui-react";
import { connect } from "react-redux";

import UserProfile from "./UserProfile";
import { User } from "../../types/User";
import { AppState } from "../../state/Store";
import { USER_PROFILE } from "../util/graphql/Queries";

interface EditUserProps {
  match: match & EditUserParams;
  user: User | null;
}

interface EditUserParams {
  params: { userId?: string };
}

const EditUserProfileWrapper: React.FC<EditUserProps> = props => {
  const loader = <Loader active inline="centered" content="Loading profile information..." />;

  let { userId } = props.match.params;
  const title = userId === undefined ? "My Profile" : "Edit User";

  const header = <Header size="huge">{title}</Header>;
  if (userId === undefined && !props.user) {
    return (
      <div>
        {header}
        {loader}
      </div>
    );
  }

  if (!userId && props.user) {
    userId = props.user.uuid;
  }

  return (
    <div>
      <Query
        query={USER_PROFILE}
        variables={{
          uuid: userId,
        }}
        fetchPolicy="no-cache"
      >
        {({ loading, error, data }: any) => {
          if (loading) {
            return loader;
          }
          if (error) {
            return <Message error visible header="Glitch in the matrix" content={error.message} />;
          }

          return <UserProfile preloadUser={data.users[0]} />;
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

export default connect(mapStateToProps)(EditUserProfileWrapper);
