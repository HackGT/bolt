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

  return (
    <Header
      rightItem={
        <>
          <Link to="/profile">
            <HeaderItem>Profile</HeaderItem>
          </Link>
          <Link to="/logout">
            <HeaderItem>Sign Out</HeaderItem>
          </Link>
        </>
      }
      rightItemMobile={
        <>
          <Link to="/profile">
            <HeaderItem>Profile</HeaderItem>
          </Link>
          <Link to="/logout">
            <HeaderItem>Sign Out</HeaderItem>
          </Link>
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
