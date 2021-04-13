import React, { Component } from "react";
import { ToastProvider } from "react-toast-notifications";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { connect } from "react-redux";

import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import HomeContainer from "./components/HomeContainer";
import CSVWizard from "./components/csv/CSVWizard";
import ItemWrapper from "./components/item/ItemWrapper";
import PrivateRoute from "./components/util/PrivateRoute";
import AdminOverviewContainer from "./components/admin/AdminOverviewContainer";
import { bugsnagClient, bugsnagEnabled } from "./index";
import AdminUsersListWrapper from "./components/admin/AdminUsersListWrapper";
import AdminRequestsWrapper from "./components/admin/AdminRequestsWrapper";
import UserProfileWrapper from "./components/users/UserProfileWrapper";
import DeskContainer from "./components/desk/DeskContainer";
import { User } from "./types/User";
import { loginUser } from "./state/Account";
import { AppState } from "./state/Store";
import CacheBuster from "./components/util/CacheBuster";
import DetailedItemStatistics from "./components/reports/statistics/DetailedItemStatistics";
import ItemDemandReport from "./components/reports/demand/ItemDemandReport";

interface OwnProps {}

interface StateProps {
  user: User | null;
  loginUser: (user: User) => void;
}

type Props = StateProps & OwnProps;

class App extends Component<Props> {
  public async componentDidMount(): Promise<void> {
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
        `,
      }),
    });
    const json = await userRequest.json();
    if (json && json.data && json.data.user) {
      const { user } = json.data;
      if (user) {
        this.props.loginUser(user);
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
            fetchResult: json,
          },
        });
      }
    }
  }

  public render() {
    return (
      <div
        style={{
          width: "100%",
          maxWidth: "960px",
          margin: "0 auto",
          padding: "0 5px",
        }}
      >
        <Router>
          <ToastProvider placement="top-center">
            <Navigation />
            <Switch>
              <Route path="/" exact component={HomeContainer} />
              <Route path="/user" component={UserProfileWrapper} />
              <PrivateRoute exact path="/admin" component={AdminOverviewContainer} />
              <PrivateRoute exact path="/admin/desk" component={DeskContainer} />
              <PrivateRoute path="/admin/items" component={ItemWrapper} />
              <PrivateRoute exact path="/admin/csv" component={CSVWizard} />
              <PrivateRoute exact path="/admin/users" component={AdminUsersListWrapper} />
              <PrivateRoute exact path="/admin/requests" component={AdminRequestsWrapper} />
              <PrivateRoute
                exact
                path="/admin/reports/statistics"
                component={DetailedItemStatistics}
              />
              <PrivateRoute exact path="/admin/reports/demand" component={ItemDemandReport} />
              <Route component={HomeContainer} />
            </Switch>
            <Footer />
          </ToastProvider>
        </Router>
        <CacheBuster>
          {({ loading, isLatestVersion, refreshCacheAndReload }: any) => {
            if (loading) {
              return null;
            }
            if (!loading && !isLatestVersion) {
              // You can decide how and when you want to force reload
              refreshCacheAndReload();
            }
            return null;
          }}
        </CacheBuster>
      </div>
    );
  }
}

function mapStateToProps(state: AppState) {
  return {
    user: state.account,
  };
}

const mapDispatchToProps = (dispatch: any) => ({
  loginUser: (user: User) => {
    dispatch(loginUser(user));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
