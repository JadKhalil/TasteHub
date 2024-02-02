import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./Layout.js";
import Global from "./components/Global.js";
import Catered from "./components/Catered.js";
import Profile from "./components/Profile.js";
import Search from "./components/Search.js";
import { GoogleLogin } from "@react-oauth/google";

function App() {
  const responseMessage = (response) => {
    console.log(response);
  };
  const errorMessage = (error) => {
    console.log(error);
  };
  return (
    <div>
      <br />
      <br />
      <GoogleLogin onSuccess={responseMessage} onError={errorMessage} />
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
    </div>
  );
}
export default App;
