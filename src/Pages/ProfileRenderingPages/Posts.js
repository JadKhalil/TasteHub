import CreatePostOverlay from "../../Elements/CreatePostOverlay";
import { useState } from "react";
import { FaCamera } from "react-icons/fa";
import CreateButton from "../CreateButton";

function Posts({ posts }) {
  const [showPostCreate, setPostCreate] = useState(false);

  const toggleCreatePostOverlay = () => {
    setPostCreate(!showPostCreate);
  };

  if (posts.length === 0) {
    return (
      <div className="emptyProfileContainer">
        <div className="profilePostEmptyContainer">
          <FaCamera className="profilePostsCameraIcon" />
        </div>

        <div className="profileShareRecepiesContainer">
          <div className="profileShareRecepies-div">Share Recepies</div>
          <div className="profileShareRecepeisInfo-div">
            When you share photos, they will appear on your profile.
          </div>
        </div>
        <div className="profileShareRecepiePrompt-div">
          <button
            className="profileShareRecepiePrompt-button"
            onClick={toggleCreatePostOverlay}
          >
            share your first recepie
          </button>
        </div>

      </div>
    );
  }

  // If there are posts, map through them and render accordingly
  return (
    <div className="profile-posts-container">
      <div>
      {showPostCreate && <CreatePostOverlay setPostCreate={setPostCreate} />}
        {<CreateButton></CreateButton>}
      </div>
      {posts.map((post) => (
        <div key={post.id} className="post">
          {/* Replace the contents below with the actual data you want to display */}
          <h3>{post.title}</h3>
          <p>{post.content}</p>
          {/* If you have images or other content, render them here */}
        </div>
      ))}
    </div>
  );
}

export default Posts;
