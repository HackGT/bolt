import React from "react";
import { Query } from "@apollo/client/react/components";
import { Header, Loader, Message } from "semantic-ui-react";
import { connect } from "react-redux";
import { useAuth } from "@hex-labs/core";

import UserProfile from "./UserProfile";
import { User } from "../../types/User";
import { AppState } from "../../state/Store";
import { USER_PROFILE } from "../../graphql/Queries";

const EditUserProfileWrapper: React.FC = props => {
  const loader = <Loader active inline="centered" content="Loading profile information..." />;

  const { user } = useAuth();

  let userId = user!.uid;
  const title = userId === undefined ? "My Profile" : "Edit User";

  if (userId === undefined && user) {
    return <Loader show />;
  }
  console.log(user);

  if (!userId && user) {
    userId = user.uid;
  }

  return (
    <div>
      return <UserProfile />;
    </div>
  );
};

function mapStateToProps(state: AppState) {
  return {
    user: state.account,
  };
}

export default connect(mapStateToProps)(EditUserProfileWrapper);
