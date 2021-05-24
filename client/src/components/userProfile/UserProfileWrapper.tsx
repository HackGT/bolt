import React from "react";
import { match, Route, Switch } from "react-router";

import PrivateRoute from "../util/PrivateRoute";
import EditUserProfileWrapper from "./EditUserProfileWrapper";

interface Props {
  match: match;
}

const UserProfileWrapper: React.FC<Props> = props => (
  <div>
    <Switch>
      <Route exact path={`${props.match.url}/me`} component={EditUserProfileWrapper} />
      <PrivateRoute exact path={`${props.match.url}/:userId`} component={EditUserProfileWrapper} />
    </Switch>
  </div>
);

export default UserProfileWrapper;
