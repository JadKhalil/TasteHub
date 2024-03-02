import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./Layout.js";
import Global from "./Pages/Global.js";
import Catered from "./Pages/Catered.js";
import Profile from "./Pages/Profile.js";
import Search from "./Pages/Search.js";
import Settings from "./Pages/Settings.js";
import axios from "axios";
import LoginStartup from "./Pages/LoginStartup.js";
import { UserProvider } from "./UserContext";

import Login from "./Pages/Login.js";
import { GoogleLogin } from "@react-oauth/google";

function App() {

  return (
      <BrowserRouter>
        <UserProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route path="global" element={<Global />}></Route>
              <Route path="catered" element={<Catered />}></Route>
              <Route path="profile" element={<Profile />}></Route>
              <Route path="search" element={<Search />}></Route>
              <Route path="settings" element={<Settings />}></Route>
              <Route path="login" element={<Login />}></Route>
              <Route path="/" element={<LoginStartup />} />
            </Route>
          </Routes>
        </UserProvider>
      </BrowserRouter>
  );
}
export default App;
