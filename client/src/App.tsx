import React from "react";
import { ToastProvider } from "react-toast-notifications";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { connect } from "react-redux";
import { useQuery } from "@apollo/client";

import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import HomeContainer from "./components/HomeContainer";
import CSVWizard from "./components/csv/CSVWizard";
import PrivateRoute from "./components/util/PrivateRoute";
import AdminOverviewContainer from "./components/admin/AdminOverviewContainer";
import { bugsnagClient, bugsnagEnabled } from "./index";
import AdminUsersListWrapper from "./components/admin/AdminUsersListWrapper";
import AdminRequestSettingsWrapper from "./components/admin/AdminRequestSettingsWrapper";
import UserProfileWrapper from "./components/users/UserProfileWrapper";
import DeskContainer from "./components/desk/DeskContainer";
import { User } from "./types/User";
import { loginUser } from "./state/Account";
import { AppState } from "./state/Store";
import CacheBuster from "./components/util/CacheBuster";
import DetailedItemStatistics from "./components/reports/statistics/DetailedItemStatistics";
import ItemDemandReport from "./components/reports/demand/ItemDemandReport";
import { USER_INFO } from "./components/util/graphql/Queries";
import LoadingSpinner from "./components/util/LoadingSpinner";
import CreateItemWrapper from "./components/item/CreateItemWrapper";
import EditItemWrapper from "./components/item/EditItemWrapper";

interface OwnProps {}

interface StateProps {
  user: User | null;
  loginUser: (user: User) => void;
}

type Props = StateProps & OwnProps;

const App: React.FC<Props> = props => {
  const { loading, data, error } = useQuery(USER_INFO);

  if (loading) {
    return <LoadingSpinner active />;
  }

  if (error) {
    console.error("Invalid user information returned by server, can't sign in: ", error);
    if (bugsnagEnabled) {
      bugsnagClient.notify("Invalid user information returned by server, can't sign in", {
        severity: "error",
        metaData: {
          fetchResult: error,
        },
      });
    }
  }

  const { user } = data;
  props.loginUser(user);
  if (bugsnagEnabled) {
    bugsnagClient.user = user;
  }

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
            <PrivateRoute exact path="/admin/items/new" component={CreateItemWrapper} />
            <PrivateRoute exact path="/admin/items/:itemId" component={EditItemWrapper} />
            <PrivateRoute exact path="/admin/csv" component={CSVWizard} />
            <PrivateRoute exact path="/admin/users" component={AdminUsersListWrapper} />
            <PrivateRoute exact path="/admin/settings" component={AdminRequestSettingsWrapper} />
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
        {({ loading: cacheLoading, isLatestVersion, refreshCacheAndReload }: any) => {
          if (!cacheLoading && !isLatestVersion) {
            // You can decide how and when you want to force reload
            refreshCacheAndReload();
          }
          return null;
        }}
      </CacheBuster>
    </div>
  );
};

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
