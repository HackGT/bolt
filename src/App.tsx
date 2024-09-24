import React from "react";
import { Route, Routes } from "react-router-dom";
import { initializeApp } from "firebase/app";
import { setPersistence, getAuth, inMemoryPersistence } from "firebase/auth";
import axios from "axios";
import { AuthProvider, Footer, LoadingScreen, useLogin } from "@hex-labs/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import HomeContainer from "./components/home/HomeContainer";
import CSVWizard from "./components/admin/csv/CSVWizard";
import AdminOverviewContainer from "./components/admin/AdminHub";
import AdminUsersList from "./components/admin/AdminUsersList";
import AdminRequestSettingsWrapper from "./components/admin/AdminRequestSettingsWrapper";
import DeskContainer from "./components/admin/desk/DeskContainer";
import CreateItemWrapper from "./components/items/CreateItemWrapper";
import HardwareHeader from "./components/home/HardwareHeader";
import EditRequest from "./components/admin/desk/submitted/EditRequest";
import ProtectedRoute from "./components/util/ProtectedRoute";
import LandingPage from "./components/home/LandingPage";
import UserProfile from "./components/userProfile/UserProfile";
import CreateCategoryWrapper from "./components/categories/CreateCategoryWrapper";

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
            <Route path="/admin/categories">
              <Route path="/admin/categories/new" element={<CreateCategoryWrapper />} />
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
