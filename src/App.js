import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./Layout.js";
import Global from "./components/Global.js";
import Catered from "./components/Catered.js";
import Profile from "./components/Profile.js";
import Search from "./components/Search.js";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="global" element={<Global />}></Route>
          <Route path="catered" element={<Catered />}></Route>
          <Route path="profile" element={<Profile />}></Route>
          <Route path="search" element={<Search />}></Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
