import React, { useState } from "react";
import CreatePostOverlay from "./CreatePostOverlay";
import "./CreateButton.css"; // Import the CSS file

function CreateButton({renderNewPost}) {
  const [showPostCreate, setPostCreate] = useState(false);

  const toggleCreatePostOverlay = () => {
    setPostCreate(!showPostCreate);
  };

  return (
    <>
      <button className="add-btn" onClick={toggleCreatePostOverlay}>
        +
      </button>
      {showPostCreate && <CreatePostOverlay setPostCreate={setPostCreate} renderNewPost={renderNewPost}/>}
    </>
  );
}

export default CreateButton;
