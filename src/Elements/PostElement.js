import React, { useState, useEffect } from "react";
import "./PostElement.css";

const PostElement = ({ postObject }) => {
    // "category": "Food",

    const [isDetailsVisible, setIsDetailsVisible] = useState(false);
    const [postedDate, setPostedDate] = useState();

    const toggleDetails = () => {
      setIsDetailsVisible(!isDetailsVisible);
    };

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

    return (
    <div className="post-container">
        <div className="post-header-container">
            <h4 className="post-name">{postObject?.recipeName}</h4>
        </div>
        <div className="post-image-container" onClick={()=> toggleDetails()}>
            <img src={postObject?.imageLink} alt={postObject?.recipeName} className="post-image"></img>
            <div className="post-prep-time-container">
                <svg className="post-prep-time-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                <span>{postObject?.prepTime} MINS</span>
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
            <div className="post-like-container">
                <svg className="post-like-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                </svg>
                <span>{postObject?.numberOfComments}</span>
            </div>
            <div className="post-like-container">
                <svg className="post-comment-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                </svg>
                <span>{postObject?.numberOfLikes}</span>
            </div>
        </div>


    </div>
    );

}


export default PostElement;