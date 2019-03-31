import React, {Component} from 'react';
import {Navigation} from "./components/Navigation";
import Footer from "./components/Footer";
import {ToastProvider} from 'react-toast-notifications';
import HomeContainer from "./components/HomeContainer";
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import ItemWrapper from "./components/item/ItemWrapper";
import RequestManagementContainer from "./components/RequestManagementContainer";

class App extends Component {
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
                            <Route path="/item" component={ItemWrapper}/>
                            <Route path="/requests" component={RequestManagementContainer}/>
                            <Route component={HomeContainer}/>
                        </Switch>
                        <Footer/>
                    </ToastProvider>
                </Router>
            </div>
        );
    }
}

export default App;
