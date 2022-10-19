import React, { useEffect, useState } from "react";
import { apiUrl, Header, HeaderItem, Service, useAuth } from "@hex-labs/core";
import { Link } from "react-router-dom";
import axios from "axios";

const HardwareHeader = () => {
  const [role, setRoles] = useState<Record<string, boolean>>({
    member: false,
    exec: false,
    admin: false,
  });
  const { user } = useAuth();

  useEffect(() => {
    const getRoles = async () => {
      if (user?.uid) {
        const response = await axios.get(apiUrl(Service.USERS, `/users/${user?.uid}`));
        setRoles({ ...response.data.roles });
      }
    };

    getRoles();
  }, [user?.uid]);

  const logOut = async () => {
    await axios.post(apiUrl(Service.AUTH, "/auth/logout"));
    window.location.href = `https://login.hexlabs.org/login?redirect=${window.location.href}`;
  };

  return (
    <Header
      rightItem={
        <>
          <Link to="/user/me">
            <HeaderItem>Profile</HeaderItem>
          </Link>
          <a onClick={logOut}>
            <HeaderItem>Sign Out</HeaderItem>
          </a>
        </>
      }
      rightItemMobile={
        <>
          <Link to="/user/me">
            <HeaderItem>Profile</HeaderItem>
          </Link>
          <a onClick={logOut}>
            <HeaderItem>Sign Out</HeaderItem>
          </a>
        </>
      }
    >
      <Link to="/">
        <HeaderItem>Home</HeaderItem>
      </Link>
      {(role.admin || role.exec) && (
        <Link to="/admin">
          <HeaderItem>Admin</HeaderItem>
        </Link>
      )}
    </Header>
  );
};

export default HardwareHeader;
