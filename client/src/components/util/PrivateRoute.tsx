import React from "react";
import {Redirect, Route} from "react-router";
import {AppState} from "../../reducers/reducers";
import {connect} from "react-redux";
import {store} from "../../store";

function userIsAdmin() {
    const state = store.getState();
    console.log(state.user, state.user !== null && state.user.admin);
    console.log("User is admin: ", state.user !== null && state.user.admin)
    return state.user !== null && state.user.admin;
}

function PrivateRoute({ component: Component, ...rest }: any) {
    return (
        <Route
            {...rest}
            render={(props: any) =>
                userIsAdmin() ? (
                    <Component {...props} />
                ) : (
                    <Redirect
                        to={{
                            pathname: "/",
                            state: { from: props.location }
                        }}
                    />
                )
            }
        />
    );
}

function mapStateToProps(state: AppState) {
    return {
        a: state.a,
        user: state.user
    };
}

export default connect(mapStateToProps) (PrivateRoute);
