import React from "react";
import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { useUser } from "../UserContext";
import { IoMdClose } from "react-icons/io";

const CreatePostOverlay = ({ setPostCreate }) => {
  const { user } = useUser(); // Details of signed in user including their email

  const [email, setEmail] = useState();
  const [userName, setUsername] = useState();
  const [recipeName, setRecipeName] = useState();
  const [imageFile, setImageFile] = useState();
  const [prepTime, setPrepTime] = useState();
  const [description, setDescription] = useState();
  const [category, setCategory] = useState();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    // Add lambda url
    setIsSubmitting(true);
    e.preventDefault(); // Prevents the popup page from closing before event is handled
    const dataToSubmit = new FormData();
    dataToSubmit.append("userEmail", email);
    dataToSubmit.append("userName", userName);
    dataToSubmit.append("postID", uuidv4());
    dataToSubmit.append("category", category);
    dataToSubmit.append("datePosted", Date.now());
    dataToSubmit.append("contentImage", imageFile);
    dataToSubmit.append("numberOfLikes", 0);
    dataToSubmit.append("numberOfComments", 0);
    dataToSubmit.append("postDescription", description);
    dataToSubmit.append("prepTime", prepTime);
    dataToSubmit.append("recipeName", recipeName);

    try {
      const response = await fetch(
        "https://w6twud32h2wkjxtnjdml6vlbq40hrtgx.lambda-url.ca-central-1.on.aws/",
        {
          method: "POST",
          body: dataToSubmit,
        }
      );
      if (response.ok) {
        setPostCreate(false); // Close the overlay
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    // Check if user is not null before accessing email property
    if (user) {
      setEmail(user?.userEmail);
      setUsername(user?.userName);
    }
    // The dependency array ensures that this effect runs whenever user changes
  }, [user]);

  const onClose = () => {
    setPostCreate(false);
  };

  return (
    <>
      <div className="create-post-container">
        <div className="create-post-popup">
          <div className="createpostFormContainer">
            <form onSubmit={(e) => handleSubmit(e)}>
              <div className="create-post-image-upload-container">
                <input
                  type="file"
                  className="imageUploads"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  required
                />
              </div>
              <div className="create-post-recipeName-container">
                <input
                  type="text"
                  placeholder="Recipe Name"
                  onChange={(e) => setRecipeName(e.target.value)}
                  required
                />
              </div>
              <div className="create-post-prepTime-container">
                <input
                  placeholder="PrepTime"
                  type="number"
                  min="1"
                  onChange={(e) => setPrepTime(e.target.value)}
                  required
                />
              </div>
              <div className="create-post-description-container">
                <input
                  type="text"
                  placeholder="Description"
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
              <div className="create-post-category-container">
                <input
                  className="category-input"
                  type="text"
                  placeholder="Category"
                  onChange={(e) => setCategory(e.target.value)}
                  required
                />
              </div>
              <div className="create-post-submit-button-container">
                <input
                  type="submit"
                  id="submit-button"
                  value="Create Post"
                  disabled={isSubmitting}
                />
              </div>
            </form>
            <div className="createPostClose-div">
              <button className="createPostClose-button" onClick={onClose}>
                <IoMdClose className="createPostIcon-IOMDClose" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreatePostOverlay;
