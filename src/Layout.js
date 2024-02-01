import React from "react";
import { Outlet } from "react-router-dom";
import SideBar from "./SideBar.js";
import "./index.css"

function Layout() {
  
  return (
    <>
      <div className="md:grid md:grid-cols-4 h-screen">
        <SideBar/>
        <Outlet/>
        <div></div>
      </div>
    </>
    );
}

export default Layout;