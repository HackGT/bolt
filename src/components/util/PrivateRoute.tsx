import React from "react";
import { LoadingScreen, useAuth } from "@hex-labs/core";
import { Navigate, Outlet, Route } from "react-router-dom";

const PrivateRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return user ? <Outlet /> : <Navigate to="/" />;
};

export default PrivateRoute;
