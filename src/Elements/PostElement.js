import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';
import "./PostElement.css";

/**
 * JSX Component for a single post.
 * 
 * This JSX component is to be rendered on a page by calling one of the GET 'posts' lambda functions
 * and iterating through the array of posts returned from the database and passing in the JSON data into the postObject parameter.
 * 
 * In order to determine the argument needed to be passed into the isPostLikedParam parameter, call 'get_user_liked_posts' lambda function
 * on one of the pages that render this component to check if the returned array contains a postID that matches the postID of the postObject parameter.
 * 
 * @param {Object} postObject           JSON Object of the post
 * @param {String} userEmail            Email of the user browsing the post, not the user who posted this recipe. It's an important distinction
 *                                      userEmail parameter is needed to like and comment on the post.
 * @param {Boolean} isPostLikedParam    True or false depending on whether the user liked the post or not.
 * 
 * @param {Boolean} isGridLayout        True or false depending on which page the post element is rendered. 
 *                                      This parameter is used to change the styling of the returned JSX element.
 * @param {function} deletePost         deletePost lambda function passed as a prop. It is in this form
 *                                      const deletePost = async (postID, posterUserEmail) => { ... }
 * @returns {JSX}
 */
const PostElement = ({ postObject , userEmail, isPostLikedParam, isGridLayout, deletePost, isCatered}) => {
    const [isFollowed, setIsFollowed] = useState(
        // 1
        //
        //
        // The call to get the followed state of this post goes here
        //      - Make sure to remove the placeholder state bellow
        //
        //
        //
        (isCatered ? true : false)
    );
    const [showComments, setShowComments] = useState(false); // Boolean for showing comments when comment button is clicked
    const [newComment, setNewComment] = useState(""); // A comment on a comment box. If this state is empty, the submit button disappears
    const [comments, setComments] = useState([]); // List of JSON objects for all comments on a post
    const [isDetailsVisible, setIsDetailsVisible] = useState(false); // Used to show and hide the post caption when user clicks on the image
    const [postedDate, setPostedDate] = useState(); // Formatted date of the post. It is initialized in the useEffect hook

    /* This hook is boolean type that used in determining whether clicking on a heart icon likes or unlikes a post.
     * If set to true, the heart icon will be filled and clicking it will call the 'unlike_post' lambda function
     * If set to false, the heart icon will be hollow and clicking it will call the 'like_post' lambda function
     */
    const [isPostLiked, setIsPostLiked] = useState(isPostLikedParam); 

    const [numberOfLikes, setNumberOfLikes] = useState(Number(postObject?.numberOfLikes)); // the number of likes on the post
    const [numberOfComments, setNumberOfComments] = useState(Number(postObject?.numberOfComments)); // the number of comments on the post


    /**
     * Shows and hides the post caption by clicking the image of the post
     */
    const toggleDetails = () => {
      setIsDetailsVisible(!isDetailsVisible);
    };

    /**
     * Followes and unfollowes
     */
    const handleIsFollowed = async () => {
        setIsFollowed(!isFollowed);

        // const res = await fetch(
        //     "https://rl4au3ybjajtx62g23eyzmiuce0ifzkc.lambda-url.ca-central-1.on.aws/",
        //     {
        //         method: "POST",
        //         headers: {
        //             "Content-Type": "application/json"
        //         },
        //         body: JSON.stringify({
        //             "userEmailOfFollower": "jeannicolasrouette@gmail.com",
        //             "userEmailOfFollowee": "edward.an03@gmail.com"
        //         })
        //     }
        // );
        
        // 3
        //
        //
        // The calls to follow/unfollow should be done here
        //
        //
        //
    };


    
    /**
     * Calls the 'create_comment' lambda function to update backend,
     * updates the comments state to include the new comment
     * and increments the number of comments on the front end side as well.
     */
    const handleAddComment = async () => {
        setNumberOfComments((prevNumberOfComments) => prevNumberOfComments + 1);

        const newCommentObject = {
            "postID": postObject?.postID,
            "commentID": uuidv4(),
            "userEmailOfCommenter": userEmail,
            "content": newComment,
            "userEmailOfPoster": postObject?.userEmail
        };
        setComments([...comments, newCommentObject]);
        const res = await fetch(
            "https://lnuwf7hmrat6ugtrnz7psympzq0zjlcx.lambda-url.ca-central-1.on.aws/",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newCommentObject)
            }
        );
        setNewComment(""); // resets the new comment state to be empty after adding comment
    }


    /**
     * Calls the 'delete_comment' lambda function to update backend,
     * updates the comments state to remove the deleted comment
     * and decrements the number of comments on the front end side as well.
     */
    const handleRemoveComment = async (comment) => {
        setNumberOfComments((prevNumberOfComments) => prevNumberOfComments - 1);
        const newListOfComments = comments.filter((item) => item?.commentID !== comment?.commentID);
        setComments(() => {
            return newListOfComments;
        })
        const res = await fetch(
            `https://arocnlgm5i7sjrxb34mimhvfmm0nxfft.lambda-url.ca-central-1.on.aws?commentID=${comment?.commentID}&postID=${comment?.postID}&userEmailOfPoster=${postObject?.userEmail}`,
            {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
            }
        );
    }


    /**
     * 
     */
    const buildComment = (comment) => {
        return (
            <div className="PE-comment-big-box" key={comment?.commentID}>
                <div className="PE-comment-box">
                    <div className="PE-comment-username">
                        {comment?.userEmailOfCommenter}:
                    </div>
                    <div className="PE-comment-text">
                        {comment?.content}
                    </div>
                </div>
                {/* 
                    // 6
                    //
                    //
                    // Bellow this comment, replace userEmail with the UserName of the 
                    // current browsing user.
                    //
                    // This change needs to be done in conjunction with a future comment 
                    // located where this fucntuion is being called from.
                    //
                    //
                    // 
                */}
                {comment?.userEmailOfCommenter === userEmail ? (
                    <div className="PE-comment-delete-box">
                        <button onClick={() => handleRemoveComment(comment)} className="PE-comment-delete-button">
                            Delete
                        </button>
                    </div>
                ) : (
                    <></>
                )}
            </div>
    
        )
    }


    /**
     * Determines whether clicking on a heart icon should call the 'like_post' lambda function or the 'unlike_post' lambda function
     */
    const handleLikes = () => {
        if (isPostLiked === false) {
            likePost();
        }
        else {
            unlikePost();
        }
    }

    /**
     * Calls the 'like_post' lambda function to update backend,
     * sets the isPostLiked hook to true,
     * and increments the number of likes on the front end side as well.
     */
    const likePost = async () => {
        setIsPostLiked(true);
        setNumberOfLikes((prevLikes) => prevLikes + 1);
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
    }

    /**
     * Calls the 'unlike_post' lambda function to update backend,
     * sets the isPostLiked hook to false,
     * and increments the number of likes on the front end side as well.
     */
    const unlikePost = async () => {
        setIsPostLiked(false);
        setNumberOfLikes((prevLikes) => prevLikes - 1);
        const promise = await fetch(
            `https://bvraqaptwxnnop2ruzr26h5ppe0wtrxi.lambda-url.ca-central-1.on.aws?userEmailOfLiker=${userEmail}&postID=${postObject?.postID}&userEmailOfPoster=${postObject?.userEmail}`,
            {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
            }
        );
    }

    /**
     * Calls the 'get_comments_on_post' lambda function fetch all the comments on this post.
     * Fills the comments array with the data.
     */
    const getComments = async () => {
        const res = await fetch(
            `https://nenqkh35mmdevuny2x7gbozquu0cquyy.lambda-url.ca-central-1.on.aws?postID=${postObject?.postID}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
            }
        );
        const jsonRes = await res.json();
        console.log(jsonRes);
        if (res.status === 200)
        {
            setComments([...jsonRes?.commentList?.Items]);
        }
        else
        {
            window.alert(`Error! status ${res.status}\n${jsonRes["message"]}`);
        }
    }

    /**
     * Asks the user if they would like to delete the post for confirmation.
     * Calls the deletePost async function passed in as a prop from a page that renders this component.
     */
    const deletePostHandler = () => {
        const confirmDelete = window.confirm("Are you sure you want to delete this post?");
        if (confirmDelete) {
          deletePost(postObject?.postID, postObject?.userEmail); // Call the deletePost function passed as a prop
        }
    };
    

    // sets the postedDate hook using the formatted value of the date this recipe is posted.
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
    

    // loads comments under a post whenever the showComments state is changed (via clicking comment button)
    useEffect(() => {
        if (showComments === true) {
            getComments();
        }
    },[showComments]);

    return (
    <div className={isGridLayout===true?"post-square-container" : "post-container"}>

        <div className="post-header-container">
            <h4 className="post-name">{postObject?.recipeName}</h4>
            {postObject.userEmail === userEmail ? (
                <></>
            ) : (
                <button className="PE-follow-button" onClick={handleIsFollowed}>{isFollowed ? "Unfollow" : "Follow"}</button>
            )}
            {(postObject?.userEmail === userEmail) ? 
                <div className="post-delete-container" onClick={()=> deletePostHandler()}>
                    <svg className="post-delete-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                </div>
            :
                <></>
            }
        </div>

        <div className="post-image-container" onClick={()=> toggleDetails()}>
            <img src={postObject?.imageLink} alt={postObject?.recipeName} 
            className={isGridLayout === true ? "post-square-image" : "post-image"} />
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
            <div className="post-like-container" onClick={ () => handleLikes() }>
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
            <div className="post-comment-container" onClick={ () => setShowComments(!showComments) }>
                <svg className="post-comment-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                </svg>
                <span>{numberOfComments}</span>
            </div>
        </div>

        {showComments ? (
            <div className="PE-comments-big-box">
                <div className="PE-comments-box">
                    {comments.map( (comment) => buildComment(comment) )}
                    <div className="PE-comment-box">
                        <div className="PE-comment-username">
                            {/* 
                                // 8
                                //
                                //
                                // This userEmail var needs to be chnaged to the userName of the Browsing user.
                                //
                                //
                                //
                            */}
                            {userEmail}:
                        </div>
                            <input
                            className="PE-comment-text-input"
                            type="text" 
                            placeholder="Enter a new comment here."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onSubmitCapture={(e) => setNewComment("set")}
                            />
                            {newComment !== "" ? (
                                <button 
                                className="PE-comment-text-submit-button"
                                onClick={() => handleAddComment()}
                                >
                                    Post New Comment
                                </button>
                            ) : (
                                <></>
                            )}
                    </div>
                </div>
            </div>
        ) : (
            <></>
        )}
    </div>
    );

}


export default PostElement;