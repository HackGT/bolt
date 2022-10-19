import React, { useEffect, useState } from "react";
import { ToastProvider } from "react-toast-notifications";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import { connect } from "react-redux";
import { useQuery } from "@apollo/client";
import { initializeApp } from "firebase/app";
import { setPersistence, getAuth, inMemoryPersistence } from "firebase/auth";
import axios from "axios";
import {
  AuthProvider,
  ErrorScreen,
  Footer,
  Header,
  HeaderItem,
  LoadingScreen,
  useLogin,
} from "@hex-labs/core";
import { Box, Container } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import HomeContainer from "./components/home/HomeContainer";
import CSVWizard from "./components/admin/csv/CSVWizard";
import AdminOverviewContainer from "./components/admin/AdminOverviewContainer";
import { bugsnagClient, bugsnagEnabled } from "./index";
import AdminUsersListWrapper from "./components/admin/AdminUsersListWrapper";
import AdminRequestSettingsWrapper from "./components/admin/AdminRequestSettingsWrapper";
import UserProfileWrapper from "./components/userProfile/UserProfileWrapper";
import DeskContainer from "./components/admin/desk/DeskContainer";
import { User } from "./types/User";
import { loginUser } from "./state/Account";
import { AppState } from "./state/Store";
import CacheBuster from "./components/util/CacheBuster";
import DetailedItemStatistics from "./components/admin/reports/statistics/DetailedItemStatistics";
import ItemDemandReport from "./components/admin/reports/demand/ItemDemandReport";
import { USER_INFO } from "./graphql/Queries";
import LoadingSpinner from "./components/util/LoadingSpinner";
import CreateItemWrapper from "./components/items/CreateItemWrapper";
import EditItemWrapper from "./components/items/EditItemWrapper";
import PrivateRoute from "./components/util/PrivateRoute";
import AxiosProvider from "./axios";
import Cart from "./components/cart/Cart";
import HardwareHeader from "./components/home/HardwareHeader";
import EditRequest from "./components/admin/desk/submitted/EditRequest";

// interface OwnProps {}

// interface StateProps {
//   user: User | null;
//   loginUser: (user: User) => void;
// }

// type Props = StateProps & OwnProps;

export const app = initializeApp({
  apiKey: "AIzaSyCsukUZtMkI5FD_etGfefO4Sr7fHkZM7Rg",
  authDomain: "hexlabs-cloud.firebaseapp.com",
});

setPersistence(getAuth(app), inMemoryPersistence);

axios.defaults.withCredentials = true;

const queryClient = new QueryClient();

const App: React.FC = () => {
  const [loading, loggedIn] = useLogin(app);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!loggedIn) {
    console.log(loggedIn);
    window.location.href = `https://login.hexlabs.org?redirect=${window.location.href}`;
    return <LoadingScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider app={app}>
        <AxiosProvider>
          <ToastProvider placement="top-center">
            <HardwareHeader />
            <Container p="8" maxW="container.lg">
              <Routes>
                <Route path="cart" element={<Cart />} />
                <Route path="/" element={<HomeContainer />} />
                <Route path="user/*" element={<UserProfileWrapper />} />
                {/* <PrivateRoute exact path="admin/items/:itemId" element={<EditItemWrapper />} />
            <PrivateRoute exact path="admin/csv" element={<CSVWizard />} />
            <PrivateRoute exact path="admin/users" element={AdminUsersListWrapper} />
            <PrivateRoute exact path="admin/settings" element={AdminRequestSettingsWrapper} />
            <PrivateRoute exact path="admin/reports/statistics" element={DetailedItemStatistics} />
            <PrivateRoute exact path="admin/reports/demand" element={ItemDemandReport} />
            <Route element={HomeContainer} /> */}
              </Routes>
            </Container>
            <Box>
              <Routes>
                <Route path="admin">
                  <Route path="items">
                    <Route path=":id" element={<EditRequest />} />
                    <Route path="new" element={<CreateItemWrapper />} />
                  </Route>
                  <Route path="desk" element={<DeskContainer />}>
                    <Route path=":location" element={<DeskContainer />} />
                  </Route>
                  <Route index element={<AdminOverviewContainer />} />
                </Route>
              </Routes>
            </Box>
            <Footer />
          </ToastProvider>
          {/* <CacheBuster>
          {({ loading: cacheLoading, isLatestVersion, refreshCacheAndReload }: any) => {
            if (!cacheLoading && !isLatestVersion) {
              // You can decide how and when you want to force reload
              refreshCacheAndReload();
            }
            return null;
          }}
        </CacheBuster> */}
          <ReactQueryDevtools />
        </AxiosProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

// function mapStateToProps(state: AppState) {
//   return {
//     user: state.account,
//   };
// }

// const mapDispatchToProps = (dispatch: any) => ({
//   loginUser: (user: User) => {
//     dispatch(loginUser(user));
//   },
// });

// export default connect(mapStateToProps, mapDispatchToProps)(App);

export default App;
