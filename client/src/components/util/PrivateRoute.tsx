import React from "react";
import {Redirect, Route} from "react-router";
import {AppState} from "../../reducers/reducers";
import {connect} from "react-redux";
import {Loader} from "semantic-ui-react";

function PrivateRoute({ component: Component, user, ...rest }: any) {
    if (user === null) {
        return <Loader active inline="centered" content="Please wait..."/>;
    }

    if (user.admin) {
        return <Route {...rest} render={(props: any) => <Component {...props} />} />;
    }

    return (
        <Route
            {...rest}
            render={(props: any) => <Redirect to={{
                pathname: "/",
                state: {from: props.location}
            }}
                />}
        />
    );
}

function mapStateToProps(state: AppState) {
    return {
        user: state.user
    };
}

export default connect(mapStateToProps)(PrivateRoute);
