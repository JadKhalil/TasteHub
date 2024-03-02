import React from "react";
import { Outlet } from "react-router-dom";
import SideBar from "./Elements/SideBar.js";
import "./index.css";
import { useUser } from "./UserContext";

function Layout() {
  const { user } = useUser();

  return (
    <>
      <div className={`layout-container ${user ? "logged-in" : ""}`}>
        {user && <SideBar />}
        <Outlet />
      </div>
    </>
  );
}

export default Layout;
