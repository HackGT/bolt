import React, {Component} from 'react';
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import {ToastProvider} from 'react-toast-notifications';
import HomeContainer from "./components/HomeContainer";
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import CSVWizard from "./components/csv/CSVWizard";
import ItemWrapper from "./components/item/ItemWrapper";
import {setUser, User} from "./actions/actions";
import {store} from "./store";
import {AppState} from "./reducers/reducers";
import {connect} from "react-redux";
import PrivateRoute from "./components/util/PrivateRoute";
import RequestManagementContainer from "./components/RequestManagementContainer";

export interface OwnProps {}

interface StateProps {
    a: number
    user: User|null
}

type Props = StateProps & OwnProps;

class App extends Component<Props, {}> {
    async checkAuth(): Promise<User> {
        return new Promise(resolve => setTimeout(() => resolve({
            "uuid": "abcdedf-afdhkasdf-adfsk",
            "name": "Evan Strat",
            "isAdmin": false
        }), 5000));
    }

    async componentWillMount(): Promise<void> {
        const user: User = await this.checkAuth();
        console.log(user);
        if (user) {
            store.dispatch(setUser(user));
        }
    }

    render() {
        return (
            <div style={{
                width: '100%',
                maxWidth: 960,
                margin: '0 auto'
            }}>
                <Router>
                    <ToastProvider placement="top-center">
                        <Navigation/>
                        <Switch>
                            <Route path="/" exact component={HomeContainer}/>
                            <PrivateRoute path="/admin/csv" component={CSVWizard}/>
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
    }
}

export default connect(mapStateToProps) (App);
