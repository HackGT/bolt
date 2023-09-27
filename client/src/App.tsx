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
import AdminOverviewContainer from "./components/admin/AdminHub";
import AdminUsersList from "./components/admin/AdminUsersList";
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
import ProtectedRoute from "./components/util/ProtectedRoute";
import LandingPage from "./components/home/LandingPage";
import UserProfile from "./components/userProfile/UserProfile";

export const app = initializeApp({
  apiKey: "AIzaSyCsukUZtMkI5FD_etGfefO4Sr7fHkZM7Rg",
  authDomain: "hexlabs-cloud.firebaseapp.com",
});

setPersistence(getAuth(app), inMemoryPersistence);

axios.defaults.withCredentials = true;

const queryClient = new QueryClient();

export const App: React.FC = () => {
  const [loading, loggedIn] = useLogin(app);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!loggedIn) {
    window.location.href = `https://login.hexlabs.org?redirect=${window.location.href}`;
  }

  return (
    <QueryClientProvider client={queryClient}>
      {/* <AuthProvider app={app}>
        <AxiosProvider>
          <Routes>
            <Route index element={<LandingPage />} />
          </Routes>
          <ToastProvider placement="top-center">
            <HardwareHeader />
            <Container p="8" maxW="container.lg">
              <Routes>
                <Route path="home" element={<HomeContainer />} />
                <Route path="user/*" element={<UserProfileWrapper />} />
                {/* <PrivateRoute exact path="admin/items/:itemId" element={<EditItemWrapper />} />
            <PrivateRoute exact path="admin/csv" element={<CSVWizard />} />
            <PrivateRoute exact path="admin/users" element={AdminUsersListWrapper} />
            <PrivateRoute exact path="admin/settings" element={AdminRequestSettingsWrapper} />
            <PrivateRoute exact path="admin/reports/statistics" element={DetailedItemStatistics} />
            <PrivateRoute exact path="admin/reports/demand" element={ItemDemandReport} />
            <Route element={HomeContainer} />
              </Routes>
            </Container>
            <Box>
              <Routes>
                <Route path="admin" element={<ProtectedRoute />}>
                  <Route path="csv" element={<CSVWizard />} />
                  <Route path="users" element={<AdminUsersListWrapper />} />
                  <Route path="settings" element={<AdminRequestSettingsWrapper />} />
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
        </CacheBuster>
          <ReactQueryDevtools />
        </AxiosProvider>
      </AuthProvider> */}
      <AuthProvider app={app}>
        <HardwareHeader />
        <Routes>
          <Route index element={<LandingPage />} />
          <Route path="/home" element={<HomeContainer />} />
          <Route path="/user" element={<UserProfile />} />
          <Route path="/admin" element={<ProtectedRoute />}>
            <Route path="/admin/csv" element={<CSVWizard />} />
            <Route path="/admin/users" element={<AdminUsersList />} />
            <Route path="/admin/settings" element={<AdminRequestSettingsWrapper />} />
            <Route path="/admin/items">
              <Route path="/admin/items/:id" element={<EditRequest />} />
              <Route path="/admin/items/new" element={<CreateItemWrapper />} />
            </Route>
            <Route path="/admin/desk" element={<DeskContainer />}>
              <Route path="/admin/desk/:location" element={<DeskContainer />} />
            </Route>
            <Route index element={<AdminOverviewContainer />} />
          </Route>
        </Routes>
        <Footer />
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
