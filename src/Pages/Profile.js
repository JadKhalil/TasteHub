import React, { useState, useEffect} from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CreatePostOverlay from "../Elements/CreatePostOverlay";
import { useUser } from "../UserContext";
import "./Profile.css";
import PostElement from "../Elements/PostElement";

function Profile() {
  const [ personalPosts, setPersonalPosts ] = useState([]); // list of all personal posts
  const { user } = useUser(); // Details of signed in user including their email
  const [ likedPostIDList, setLikedPostIDList ] = useState([]); // list of IDs of posts the user has liked

  // initially the likedpostID is not listed. 
  // This hook is here to ensure the post is loaded AFTER all the liked post IDs are found in the database
  const [isLikedPostIDListLoaded, setIsLikedPostIDListLoaded ] = useState(false); 

  const loadPersonalPosts = async() => {
    const res = await fetch(
      `https://2pkenopomdasergcizbgniu25y0prrhp.lambda-url.ca-central-1.on.aws?userEmail=${user.email}`, // Lambda Function URL (needs to be hard coded)
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

      setPersonalPosts([...jsonRes?.postList?.Items]);
    }
    else
    {
      window.alert(`Error! status ${res.status}\n${jsonRes["message"]}`);
    }
  }

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

  useEffect(() => {
    // Check if user is not null before accessing email property
    if (user) {
      loadLikedPostIDList();
      loadPersonalPosts();
    }
    // The dependency array ensures that this effect runs whenever user changes
  }, [user]);

  return (
    <div className="profile-container">
      <h1>Profile</h1>
      <CreatePostOverlay/>

      <div className="profile-grid-container" >
      {isLikedPostIDListLoaded && personalPosts.map((post)=> {
      return (<PostElement 
              postObject={post} 
              userEmail={user?.email} 
              isPostLikedParam={likedPostIDList.some(likedPost => likedPost.postID === post?.postID)} 
              isGridLayout={true}
              key={post?.postID}/>)
      })}
      </div>
    </div>
  );
}

export default Profile;
