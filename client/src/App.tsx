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

export interface OwnProps {}

interface StateProps {
    a: number;
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
        const user = json.data.user;
        console.log(user);
        if (user) {
            store.dispatch(setUser(user));
        }
    }


    public render() {
        return (
            <div style={{
                width: "100%",
                maxWidth: 960,
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
        a: state.a,
        user: state.user
    };
}

export default connect(mapStateToProps) (App);
