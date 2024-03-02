import React, { useState, useEffect } from "react";
import "./PostElement.css";

/**
 * 
 * @param {Object} postObject JSON Object of the post
 * @param {String} userEmail Email of the user, not the poster. User email is needed to like and comment on the post
 * @param {Boolean} isPostLiked True or false depending on whether the user liked the post or not
 * @returns {JSX}
 */
const PostElement = ({ postObject , userEmail, isPostLikedParam}) => {
    const [isDetailsVisible, setIsDetailsVisible] = useState(false); // Used to show and hide the post caption
    const [postedDate, setPostedDate] = useState(); // Formatted date of the post
    const [isPostLiked, setIsPostLiked] = useState(isPostLikedParam);
    const [numberOfLikes, setNumberOfLikes] = useState(Number(postObject?.numberOfLikes));
    const [numberOfComments, setNumberOfComments] = useState(Number(postObject?.numberOfComments));

    /**
     * Showing and hiding the post caption by clicking the image of the post
     */
    const toggleDetails = () => {
      setIsDetailsVisible(!isDetailsVisible);
    };

    const handleLikes = async () => {
        if (isPostLiked === false) {
            likePost();
        }
        else {
            unlikePost();
        }
    }

    const likePost = async () => {
        const promise = await fetch(
            `https://en46iryruu4einvaoz24oq5lie0ifwvy.lambda-url.ca-central-1.on.aws`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "postID": postObject?.postID,
                    "userEmailOfLiker": userEmail,
                    "userEmailOfPoster": postObject?.userEmail
                })
            }
        );
        const jsonPromise = await promise.json(); // Used to access the body of the returned Json
        console.log(jsonPromise);
        setIsPostLiked(true);
        setNumberOfLikes((prevLikes) => prevLikes + 1);
    }

    const unlikePost = async () => {
        const promise = await fetch(
            `https://bvraqaptwxnnop2ruzr26h5ppe0wtrxi.lambda-url.ca-central-1.on.aws?userEmailOfLiker=${userEmail}&postID=${postObject?.postID}&userEmailOfPoster=${postObject?.userEmail}`,
            {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
            }
        );
        const jsonPromise = await promise.json(); // Used to access the body of the returned Json
        console.log(jsonPromise);
        setIsPostLiked(false);
        setNumberOfLikes((prevLikes) => prevLikes - 1);
    }

    useEffect(()=> {
        const date = new Date(Number(postObject?.datePosted));
        const options = {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: true,
            timeZoneName: 'short',
          };
          
        const formattedDate = new Intl.DateTimeFormat('en-US', options).format(date);
        setPostedDate(formattedDate);
    },[]);

    console.log(isPostLiked);
    return (
    <div className="post-container">
        <div className="post-header-container">
            <h4 className="post-name">{postObject?.recipeName}</h4>
        </div>
        <div className="post-image-container" onClick={()=> toggleDetails()}>
            <img src={postObject?.imageLink} alt={postObject?.recipeName} className="post-image"></img>
            <div className="post-prep-time-badge">
                <svg className="post-prep-time-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                <span>{postObject?.prepTime} MINS</span>
            </div>
            <div className="post-category-badge">
                <span>Category: {postObject?.category}</span>
            </div>
        </div>
        <span className="post-user-email">Posted by {postObject?.userEmail}</span>
        {isDetailsVisible && (
        <div className="post-detailed-container">
          <p className="post-description">{postObject?.postDescription}</p>
          <p className="post-date">Posted on: {postedDate}</p>
        </div>
        )}
        <div className="post-like-comment-container">
            <div className="post-like-container" onClick={()=>handleLikes()}>
                {isPostLiked===true ? 
                <svg className="post-filled-like-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" >
                    <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
                </svg>
                :
                <svg className="post-hollow-like-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                </svg>
                }
                <span>{numberOfLikes}</span>
            </div>
            <div className="post-comment-container">
                <svg className="post-comment-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                </svg>
                <span>{numberOfComments}</span>
            </div>
        </div>


    </div>
    );

}


export default PostElement;