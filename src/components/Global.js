import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CreatePostPage from "./CreatePost";

function Global() {
  return (
    <>
      <h>Global</h>
      <CreatePostPage />
    </>
  );
}

export default Global;
