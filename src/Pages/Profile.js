import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CreatePostOverlay from "../Elements/CreatePostOverlay";
import "./Profile.css";

function Profile() {
  return (
    <div className="profile-container">
      <h1>Profile</h1>
      <CreatePostOverlay/>
    </div>
  );
}

export default Profile;
