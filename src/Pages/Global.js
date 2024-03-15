import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PostElement from "../Elements/PostElement";
import { useUser } from "../UserContext";
import "./Global.css";

/**
 * JSX Component for the global page.
 * 
 * Loads all posts in a scrollable layout
 * 
 * @returns {JSX}
 */
function Global() {
  const [ allPosts, setAllPosts ] = useState([]); // list of all posts
  const { user } = useUser(); // Details of signed in user including their email
  const [ likedPostIDList, setLikedPostIDList ] = useState([]); // list of IDs of posts the user has liked

  /* 
   * initially set to false as the list of likedPostIDs take time to load from the database.
   * This hook is here to ensure the post is loaded AFTER all the liked post IDs are found in the database.
   * Without this hook, there may be bugs where heart icon of the rendered post is hollow despite the fact that the user has previously
   * liked the post. 
   */ 
  const [isLikedPostIDListLoaded, setIsLikedPostIDListLoaded ] = useState(false); 
  
  /**
   * Calls the 'get_all_posts' lambda function to fetch all the posts in the application.
   * Sorts the returned data based on the date posted and fills the allPosts array with the sorted data.
   */
  const loadAllPosts = async() => {
    const res = await fetch(
      "https://3l4lzvgaso73rkupogicrcwunm0voagl.lambda-url.ca-central-1.on.aws/", // Lambda Function URL (needs to be hard coded)
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        },
      }
    );

    const jsonRes = await res.json();
    if (res.status === 200)
    {
      // the post list items are ordered by submit time
      jsonRes?.postList?.Items.sort((a, b) => {
        if (a['datePosted'] > b['datePosted']) {
          return -1;
        }
        if (a['datePosted'] < b['datePosted']) {
          return 1;
        }
        return 0;
      });

      setAllPosts([...jsonRes?.postList?.Items]);
    }
    else
    {
      window.alert(`Error! status ${res.status}\n${jsonRes["message"]}`);
    }
  }


  /**
   * Calls the 'get_user_liked_posts' lambda function to fetch the IDs of all the posts the user has previously liked.
   * Fills the likedPostIDList with the returned data.
   * Sets the isLikedPostIDListLoaded hook to true.
   */
  const loadLikedPostIDList = async () => {
    const res = await fetch(
      `https://fmepbkghyequf22cdhtoerx7ui0gtimv.lambda-url.ca-central-1.on.aws?userEmailOfLiker=${user.email}`, // Lambda Function URL (needs to be hard coded)
      {
          method: "GET",
          headers: {
              "Content-Type": "application/json"
          },
      }
    );
    const jsonRes = await res.json();
    if (res.status === 200)
    {
      setLikedPostIDList([...jsonRes?.likeList?.Items]);
      setIsLikedPostIDListLoaded(true);
    }
    else
    {
      window.alert(`Error! status ${res.status}\n${jsonRes["message"]}`);
    }
  }

  /**
   * Calls the 'delete_post' lambda function to remove the post from the database.
   * Removes the deleted post from allPosts list
   * 
   * @param {String} postID           postID of the post
   * @param {String} posterUserEmail  userEmail of the poster
   */
  const deletePost = async (postID, posterUserEmail) => {
    try {
      const response = await fetch(
        `https://fbn3kgu4tkf52n3vkqw27qhx4m0xdyob.lambda-url.ca-central-1.on.aws?postID=${postID}&userEmail=${posterUserEmail}`, // Lambda Function URL (needs to be hard coded)
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      if (response.ok) {
        window.alert("Post deleted successfully");
        loadAllPosts(); // API Get Request
      } else {
        // Error handling for unsuccessful deletion
        window.alert("Failed to delete post");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      window.alert("An error occurred while deleting the post");
    }
  };

  // When the user data is fetched, the likedPostIDList and loadAllPosts functions are called
  // This is to ensure that the posts are rendered after all the liked post is returned
  useEffect(() => {
    if (user) {
      loadLikedPostIDList();
      loadAllPosts();
    }
    // The dependency array ensures that this effect runs whenever user changes
  }, [user]);

  return (
    user && (
    <div className="global-big-box">
      <div className="global-box">

        <div className="global-header-big-box">
          <div className="global-header-box">
            <h1 className="global-header-label-h1">Global</h1>
          </div>
        </div>

        <div className="global-post-list-big-box">
          <div className="global-post-list-box">
            {isLikedPostIDListLoaded && allPosts.map((post)=> { 
              // Posts are rendered only after the likedPostIDList is loaded to ensure the heart icon is filled/empty depending on
              // whether the user has previous liked the post
                return (
                  <PostElement 
                    postObject={post} 
                    userEmail={user?.email} 
                    isPostLikedParam={likedPostIDList.some(likedPost => likedPost.postID === post?.postID)} 
                    isGridLayout={false}
                    deletePost={deletePost}
                    isCatered={false}
                    key={post?.postID}
                  />
                )
            })}
          </div>
        </div>

      </div>
    </div>
    )
  );
}

export default Global;
