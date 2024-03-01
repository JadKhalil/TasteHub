import React from "react";
import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { v4 as uuidv4 } from 'uuid';


/*
    1. userEmail (String)
    2. postID (Unique)
    3. category (String)
    4. datePosted (String)
    5. contentImage (image)
    6. numberOfLikes (Number)
    7. numberOfComments (Number)
    8. postDescription (String)
    9. prepTime (Number)
    10. recipeName (String)
*/

function CreatePostPage() {

    const [email, setEmail] = useState();
    const [recipeName, setRecipeName] = useState();
    const [imageFile, setImageFile] = useState();
    const [prepTime, setPrepTime] = useState();
    const [description, setDescription] = useState();
    const [category, setCategory] = useState();
     

  const handleSubmit = async (e) => { // Add lambda url
    e.preventDefault(); // Prevents the popup page from closing before event is handled
    console.log("You clicked submit");
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
    console.log(dataToSubmit.entries());
    const jsonPromise = await promise.json(); // Used to access the body of the returned Json
    console.log(jsonPromise);
}

  return (
    <>
      <div className='popup-container'>
            <div className='popup-title-container'>
                <h1>Create a New Post</h1>
            </div>

            <form onSubmit={ (e) => handleSubmit(e) }>
                <div className='image-upload-container'>
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
                <div className='name-container'>
                    <input className='name-input' type="text" placeholder="Email" onChange={ (e) => setEmail(e.target.value) } required/>
                </div>
                <div className='recipeName-container'>
                    <input className='recipeName-input' type="text" placeholder="Recipe Name" onChange={ (e) => setRecipeName(e.target.value) } required/>
                </div>
                <div className='prepTime-container'>
                    <label>Prep Time</label>
                    <input className='prepTime-input' min='1' type="number" onChange={ (e) => setPrepTime(e.target.value) } required/>
                </div>
                <div className='description-container'>
                    <input className='description-input' type="text" placeholder="Description" onChange={ (e) => setDescription(e.target.value) } required/>
                </div>
                <div className='category-container'>
                    <input className='category-input' type="text" placeholder="Category" onChange={ (e) => setCategory(e.target.value) } required/>
                </div>
                <div className='submit-button-container'>
                    <input type="submit" id='submit-button' value="Create Post" />
                </div>
            </form>
        </div>
    </>
  );
}

export default CreatePostPage;
