import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CreatePostOverlay from "./../Elements/CreatePostOverlay";
import "./CreateButton.css"; // Import the CSS file

function CreateButton() {
  const [showPostCreate, setPostCreate] = useState(false);

  const toggleCreatePostOverlay = () => {
    setPostCreate(!showPostCreate);
  };

  return (
    <>
      <button className="add-btn" onClick={toggleCreatePostOverlay}>
        +
      </button>
      {showPostCreate && <CreatePostOverlay setPostCreate={setPostCreate} />}
    </>
  );
}

export default CreateButton;
