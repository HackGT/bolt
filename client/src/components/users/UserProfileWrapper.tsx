import React, {Component} from "react";
import {connect} from "react-redux";
import {AppState} from "../../reducers/reducers";
import {match, Route, Switch} from "react-router";
import PrivateRoute from "../util/PrivateRoute";
import EditUserProfileWrapper from "./EditUserProfileWrapper";

class UserProfileWrapper extends Component<{ match: match }> {
    public render() {
        console.log(this.props.match.url);
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


function mapStateToProps(state: AppState) {
    return {
        user: state.user
    };
}

export default connect(
    mapStateToProps
)(UserProfileWrapper);
