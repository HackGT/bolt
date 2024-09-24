import React from "react";
import { Route, Routes } from "react-router-dom";

import EditUserProfileWrapper from "./EditUserProfileWrapper";
import UserProfile from "./UserProfile";

const UserProfileWrapper: React.FC = props => (
  <div>
    <Routes>
      <Route path="/me" element={<UserProfile />} />
      <Route path="/:userId" element={<EditUserProfileWrapper />} />
    </Routes>
  </div>
);

export default UserProfileWrapper;
