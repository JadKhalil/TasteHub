import React from "react";
import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { v4 as uuidv4 } from 'uuid';
import { useUser } from "../UserContext";


const CreatePostOverlay = () => {
    const { user } = useUser(); // Details of signed in user including their email

    const [email, setEmail] = useState();
    const [recipeName, setRecipeName] = useState();
    const [imageFile, setImageFile] = useState();
    const [prepTime, setPrepTime] = useState();
    const [description, setDescription] = useState();
    const [category, setCategory] = useState();

  const handleSubmit = async (e) => { // Add lambda url
    e.preventDefault(); // Prevents the popup page from closing before event is handled
    const dataToSubmit = new FormData();
    dataToSubmit.append("userEmail", email);
    dataToSubmit.append("postID", uuidv4());
    dataToSubmit.append("category", category);
    dataToSubmit.append("datePosted", Date.now());
    dataToSubmit.append("contentImage", imageFile);
    dataToSubmit.append("numberOfLikes", 0);
    dataToSubmit.append("numberOfComments", 0);
    dataToSubmit.append("postDescription", description);
    dataToSubmit.append("prepTime", prepTime);
    dataToSubmit.append("recipeName", recipeName);

    const promise = await fetch(
        "https://w6twud32h2wkjxtnjdml6vlbq40hrtgx.lambda-url.ca-central-1.on.aws/", // Lambda Function URL (needs to be hard coded)
        {
            method: "POST",
            body: dataToSubmit,
        }
    );
    const jsonPromise = await promise.json(); // Used to access the body of the returned Json
    }

    useEffect(() => {
        // Check if user is not null before accessing email property
        if (user) {
          setEmail(user?.email);
        }
        // The dependency array ensures that this effect runs whenever user changes
      }, [user]);

  return (
    <>
      <div className='create-post-container'>
            <div className='create-post-title-container'>
                <h1>Create a New Post</h1>
            </div>

            <form onSubmit={ (e) => handleSubmit(e) }>
                <div className='create-post-image-upload-container'>
                    <label htmlFor='imageUploads' id='imageUploadsLabel'>Select a post image</label>
                    {imageFile !== null && imageFile !== undefined ? <b> ({imageFile.name})</b>: ""}
                    <input
                    type="file" 
                    id='imageUploads' 
                    accept='image/*'
                    onChange={(e) => setImageFile(e.target.files[0])}
                    required
                    />
                </div>
                <div className='create-post-recipeName-container'>
                    <input type="text" placeholder="Recipe Name" onChange={ (e) => setRecipeName(e.target.value) } required/>
                </div>
                <div className='create-post-prepTime-container'>
                    <label>Prep Time</label>
                    <input type="number" min='1' onChange={ (e) => setPrepTime(e.target.value) } required/>
                </div>
                <div className='create-post-description-container'>
                    <input type="text" placeholder="Description" onChange={ (e) => setDescription(e.target.value) } required/>
                </div>
                <div className='create-post-category-container'>
                    <input className='category-input' type="text" placeholder="Category" onChange={ (e) => setCategory(e.target.value) } required/>
                </div>
                <div className='create-post-submit-button-container'>
                    <input type="submit" id='submit-button' value="Create Post" />
                </div>
            </form>
        </div>
    </>
  );
}

export default CreatePostOverlay;
