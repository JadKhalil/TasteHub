import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CreatePostPage from "./CreatePost";

function Global() {
  return (
    <>
      <h1>Global</h1>
      <CreatePostPage />
    </>
  );
}

export default Global;
