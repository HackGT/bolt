import React from "react";
import { match, Switch } from "react-router";

import CreateItemWrapper from "./CreateItemWrapper";
import PrivateRoute from "../util/PrivateRoute";
import EditItemWrapper from "./EditItemWrapper";

interface ItemWrapperProps {
  match: match;
}

const ItemWrapper: React.FC<ItemWrapperProps> = props => (
  <div>
    <Switch>
      <PrivateRoute exact path={`${props.match.url}/new`} component={CreateItemWrapper} />
      <PrivateRoute exact path={`${props.match.url}/:itemId`} component={EditItemWrapper} />
    </Switch>
  </div>
);

export default ItemWrapper;
