import { apiUrl, LoadingScreen, Service, useAuth } from "@hex-labs/core";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = (): React.ReactElement => {
  const { user, loading } = useAuth();
  const [role, setRoles] = useState<any>();

  useEffect(() => {
    const getRoles = async () => {
      if (user?.uid) {
        const response = await axios.get(apiUrl(Service.USERS, `/users/${user?.uid}`));
        setRoles({ ...response.data.roles });
      }
    };

    getRoles();
  }, [user?.uid]);

  if (!role || loading) {
    return <LoadingScreen />;
  }

  if (role && !role.admin && !role.exec && !role.member) return <Navigate to="/" replace />;

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <Outlet />;
};

export default ProtectedRoute;
