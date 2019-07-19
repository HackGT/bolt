import React, {Component} from "react";
import Navigation from "./components/navigation/Navigation";
import Footer from "./components/Footer";
import {ToastProvider} from "react-toast-notifications";
import HomeContainer from "./components/HomeContainer";
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import CSVWizard from "./components/csv/CSVWizard";
import CheckinContainer from "./components/checkin/CheckinContainer";
import ItemWrapper from "./components/item/ItemWrapper";
import {setUser, User} from "./actions/actions";
import {store} from "./store";
import {AppState} from "./reducers/reducers";
import {connect} from "react-redux";
import PrivateRoute from "./components/util/PrivateRoute";
import RequestManagementContainer from "./components/RequestManagementContainer";
import AdminOverviewContainer from "./components/admin/AdminOverviewContainer";
import {bugsnagClient, bugsnagEnabled} from "./index";

export interface OwnProps {}

interface StateProps {
    user: User|null;
}

type Props = StateProps & OwnProps;

class App extends Component<Props, {}> {
    public async componentWillMount(): Promise<void> {
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
                if (bugsnagEnabled) {
                    bugsnagClient.user = user;
                }
            }
        } else {
            console.error("Invalid user information returned by server, can't sign in: ", json);
            if (bugsnagEnabled) {
                bugsnagClient.notify("Invalid user information returned by server, can't sign in", {
                    severity: "error",
                    metaData: {
                        fetchResult: json
                    }
                });
            }
        }
    }


    public render() {
        return (
            <div style={{
                width: "100%",
                maxWidth: "960px",
                margin: "0 auto"
            }}>
                <Router>
                    <ToastProvider placement="top-center">
                        <Navigation/>
                        <Switch>
                            <Route path="/" exact component={HomeContainer}/>
                            <PrivateRoute path="/admin/items" component={ItemWrapper}/>
                            <PrivateRoute exact path="/requests" component={RequestManagementContainer}/>
                            <PrivateRoute exact path="/admin" component={AdminOverviewContainer}/>
                            <PrivateRoute exact path="/admin/csv" component={CSVWizard}/>
                            <PrivateRoute exact path="/admin/checkin" component={CheckinContainer}/>
                            <Route component={HomeContainer}/>
                        </Switch>
                        <Footer/>
                    </ToastProvider>
                </Router>
            </div>
        );
    }
}

function mapStateToProps(state: AppState) {
    return {
        user: state.user
    };
}

export default connect(mapStateToProps) (App);
