import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PostElement from "../Elements/PostElement";
import { useUser } from "../UserContext";
import "./Global.css";

function Global() {
  const [ allPosts, setAllPosts ] = useState([]); // list of all posts
  const { user } = useUser(); // Details of signed in user including their email
  const [ userLikedPostIDs, setUserLikedPostIDs ] = useState([]); // list of IDs of posts the user has liked
  
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

  const loadLikedPostIDs = async () => {
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
      setUserLikedPostIDs([...jsonRes?.likeList?.Items]);
    }
    else
    {
      window.alert(`Error! status ${res.status}\n${jsonRes["message"]}`);
    }
  }

  useEffect(() => {
    // Check if user is not null before accessing email property
    if (user) {
      loadLikedPostIDs();
      loadAllPosts();
    }
    // The dependency array ensures that this effect runs whenever user changes
  }, [user]);

  console.log(userLikedPostIDs);

  return (
    <div className="global-container">
      <h1>Global</h1>
      {allPosts.map((post)=> {
          return (<PostElement 
                  postObject={post} 
                  userEmail={user?.email} 
                  isPostLikedParam={userLikedPostIDs.some(likedPost => likedPost.postID === post?.postID)} 
                  key={post?.postID}/>)
      })}
    </div>
  );
}

export default Global;
