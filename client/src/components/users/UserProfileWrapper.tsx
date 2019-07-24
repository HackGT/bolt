import React, {Component} from "react";
import {connect} from "react-redux";
import {AppState} from "../../reducers/reducers";
import {match, Route, Switch} from "react-router";
import PrivateRoute from "../util/PrivateRoute";
import UserProfile from "./UserProfile";

class UserProfileWrapper extends Component<{ match: match }> {
    public render() {
        console.log(this.props.match.url);
        return (
            <Switch>
                <Route exact path={`${this.props.match.url}/me`} component={UserProfile} />
                <PrivateRoute exact path={`${this.props.match.url}/:userId`} component={UserProfile}/>
            </Switch>
        );
    }
}

export default UserProfileWrapper;
