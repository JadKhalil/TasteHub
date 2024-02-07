import React from "react";
import { Outlet } from "react-router-dom";
import SideBar from "./SideBar.js";
import "./index.css";
import { useUser } from "./UserContext";

function Layout() {
  const { user } = useUser();

  return (
    <>
      <div className={`layout-grid ${user ? "logged-in" : ""} h-screen`}>
        {user && <SideBar />}
        <Outlet />
        <div></div>
      </div>
    </>
  );
}

export default Layout;
