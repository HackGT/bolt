import React, { Component } from "react";
import { match, Switch } from "react-router";

import CreateItemWrapper from "./CreateItemWrapper";
import PrivateRoute from "../util/PrivateRoute";
import EditItemWrapper from "./EditItemWrapper";

class ItemWrapper extends Component<{ match: match }> {
  public render() {
    return (
      <div>
        <Switch>
          <PrivateRoute exact path={`${this.props.match.url}/new`} component={CreateItemWrapper} />
          <PrivateRoute
            exact
            path={`${this.props.match.url}/:itemId`}
            component={EditItemWrapper}
          />
        </Switch>
      </div>
    );
  }
}

export default ItemWrapper;
