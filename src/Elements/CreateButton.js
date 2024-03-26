import React, { useState } from "react";
import CreatePostOverlay from "./CreatePostOverlay";
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
