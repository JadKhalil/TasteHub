import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CreatePostOverlay from "./../Elements/CreatePostOverlay";
import { FaPlus } from "react-icons/fa";
import "./CreateButton.css";

function CreateButton() {
  const [showPostCreate, setPostCreate] = useState(false);

  const toggleCreatePostOverlay = () => {
    setPostCreate(!showPostCreate);
  };

  return (
    <>
      <button className="create-post-button" onClick={toggleCreatePostOverlay}>
        <FaPlus className="create-post-icon" />
      </button>
      {showPostCreate && <CreatePostOverlay setPostCreate={setPostCreate} />}
    </>
  );
}

export default CreateButton;
