import React, {Component} from "react";
import {match, Route, Switch} from "react-router";
import PrivateRoute from "../util/PrivateRoute";
import EditUserProfileWrapper from "./EditUserProfileWrapper";

class UserProfileWrapper extends Component<{ match: match }> {
    public render() {
        return (
            <div>
                <Switch>
                    <Route exact path={`${this.props.match.url}/me`} component={EditUserProfileWrapper}/>
                    <PrivateRoute exact path={`${this.props.match.url}/:userId`} component={EditUserProfileWrapper}/>
                </Switch>
            </div>
        );
    }
}

export default UserProfileWrapper;
