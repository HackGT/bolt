import React, { ReactNode } from "react";
import { useAuth } from "@hex-labs/core";
import axios from "axios";

const AxiosProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  axios.defaults.baseURL = "http://localhost:8007";

  axios.interceptors.request.use(
    async config => {
      const token = await user?.getIdToken();
      if (token) {
        config.headers!.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    error => Promise.reject(error)
  );

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{children}</>;
};

export default AxiosProvider;
