import React from "react";
import Login from "./Login"; 
import { googleLogout } from "@react-oauth/google";

function Settings() {
  return (
    <div>
      <h2>Settings</h2>
      <Login />
    </div>
  );
}

export default Settings;
