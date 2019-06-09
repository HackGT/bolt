import React, {Component} from "react";
import Navigation from "./components/Navigation";
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
        console.log(json);
        if (json && json.data && json.data.user) {
            const user = json.data.user;
            console.log(user);
            if (user) {
                store.dispatch(setUser(user));
            }
        } else {
            console.error("Invalid user information returned by server, can't sign in:", json);
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
                            <PrivateRoute path="/admin/csv" component={CSVWizard}/>
                            <PrivateRoute path="/admin/checkin" component={CheckinContainer}/>
                            <PrivateRoute path="/item" component={ItemWrapper}/>
                            <PrivateRoute path="/requests" component={RequestManagementContainer}/>
                            <PrivateRoute path="/admin" component={AdminOverviewContainer}/>
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
