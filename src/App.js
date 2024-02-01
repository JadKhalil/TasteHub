import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route} from "react-router-dom";
import Layout from "./Layout.js";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout/>}>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
