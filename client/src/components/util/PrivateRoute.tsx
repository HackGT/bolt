import React from "react";
import {Redirect, Route} from "react-router";
import {AppState} from "../../reducers/reducers";
import {connect} from "react-redux";
import {store} from "../../store";
import {setUser} from "../../actions";

async function userIsAdmin() {
    const state = store.getState();
    // If it looks like this user isn't an admin request their info since sometimes the user info
    // isn't immediately known on a new page load
    if (state.user === null || !state.user.admin) {

        const userRequest = await fetch("/api", {
            credentials: "include",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                query: `
                        query {
                          user {
                            uuid
                            name
                            admin
                          }
                        }
                    `
            }),
        });
        const json = await userRequest.json();
        if (json && json.data && json.data.user) {
            const user = json.data.user;
            if (user) {
                store.dispatch(setUser(user));
            }
        } else {
            console.error("Invalid user information returned by server, can't sign in:", json);
        }
    }

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
        user: state.user
    };
}

export default connect(mapStateToProps) (PrivateRoute);
