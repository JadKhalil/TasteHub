import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./Layout.js";
import Global from "./components/Global.js";
import Catered from "./components/Catered.js";
import Profile from "./components/Profile.js";
import Search from "./components/Search.js";
import Settings from "./components/Settings.js";
import axios from "axios";
import LoginStartup from "./LoginStartup";
import { UserProvider } from "./UserContext";

import Login from "./Login.js";
import { GoogleLogin } from "@react-oauth/google";

function App() {

  return (
    <div>
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
    </div>
  );
}
export default App;
