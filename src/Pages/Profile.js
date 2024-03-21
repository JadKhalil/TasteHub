import React, { useState, useEffect} from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CreatePostOverlay from "../Elements/CreatePostOverlay";
import { useUser } from "../UserContext";
import "./Profile.css";
import PostElement from "../Elements/PostElement";
import ProfileTabs from "./ProfileTabs";

import Posts from "./ProfileRenderingPages/Posts";
import Saved from "./ProfileRenderingPages/Saved";
import Taged from "./ProfileRenderingPages/Taged";
/**
 * JSX Component for the Profile page.
 * 
 * Loads personal posts in a grid layout
 * 
 * @returns {JSX}
 */
function Profile() {
  const [ personalPosts, setPersonalPosts ] = useState([]); // list of all personal posts
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
   * Calls the 'get_personal_posts' lambda function to fetch all the posts in the application.
   * Sorts the returned data based on the date posted and fills the personalPosts array with the sorted data.
   */
  const loadPersonalPosts = async() => {
    const res = await fetch(
      `https://2pkenopomdasergcizbgniu25y0prrhp.lambda-url.ca-central-1.on.aws?userEmail=${user.userEmail}`, // Lambda Function URL (needs to be hard coded)
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        },
      }
    );
    console.log("load personal posts request called");
    const jsonRes = await res.json();
    if (res.status === 200)
    {
      // the post list items are ordered by submit time
      jsonRes?.postList?.Items?.sort((a, b) => {
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

  /**
   * Calls the 'get_user_liked_posts' lambda function to fetch the IDs of all the posts the user has previously liked.
   * Fills the likedPostIDList with the returned data.
   * Sets the isLikedPostIDListLoaded hook to true.
   */
  const loadLikedPostIDList = async () => {
    const res = await fetch(
      `https://fmepbkghyequf22cdhtoerx7ui0gtimv.lambda-url.ca-central-1.on.aws?userEmailOfLiker=${user.userEmail}`, // Lambda Function URL (needs to be hard coded)
      {
          method: "GET",
          headers: {
              "Content-Type": "application/json"
          },
      }
    );
    console.log("load liked post id request called");
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
   * Removes the deleted post from personalPosts list
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
        console.log("delete post request called");
        if (response.ok) {
          window.alert("Post deleted successfully");
          loadPersonalPosts(); // API Get Request
        } else {
          // Error handling for unsuccessful deletion
          window.alert("Failed to delete post");
        }
      } catch (error) {
        console.error("Error deleting post:", error);
        window.alert("An error occurred while deleting the post");
      }
    };

  // When the user data is fetched, the loadLikedPostIDList, loadListOfFollowing, and loadPersonalPosts functions are called
  // This is to ensure that the posts are rendered after all the liked post is returned
  useEffect(() => {
    if (user) {
      loadLikedPostIDList();
      loadPersonalPosts();
    }
    // The dependency array ensures that this effect runs whenever user changes
  }, [user]);

  

  // use state for the selected Tab
  const [selectedTab, setSelectedTab] = useState('posts');

  return (
    user && (
    <div className="profile-container">
      
      <div className="profileHeader-container">
        <div className="profileImg">
          <img src={user.image}
          className="imgprofile-container"/>
        </div>

        <div className="profileName-bio-container">
          
          <div className="profileFollower-container">
            <div className="name-container">{user.userName}</div>
              <div className="editprofile-div">
                <button className="editprofile-button">
                  Edit profile
                </button>
              </div>

              <div className="logoutprofile-div"> 
                <button className="logoutprofile-button">
                  Log Out
                </button>
              </div>
            </div>  

            <div className="Follwer-FollowingDisplay">
              <div className="profilePosts"> Posts</div>
              <div className="profilefollowers"> Followers</div>
              <div className="profilefollowing"> Following</div>
            </div>

         

            <div className="bio-information-container">
              <p>
                Make Bio dynamic
              </p>
            </div>
        </div>
      </div>

      <ProfileTabs selected={selectedTab} onSelect={setSelectedTab} />

      <div className="profilePosts-container">
        {selectedTab === 'posts' ? (
          <>
            <Posts posts={personalPosts}/>
          </>
          ) : selectedTab === 'saved' ? (
            <>
              <Saved/>
            </>
          ) : selectedTab === 'tagged' ? (
            <>
              <Taged/>
            </>
          ) : null}

      </div>
      
      {/* <div className="posts-container">
          
        </div>

        <div className="createposts-overlay-container">
          <CreatePostOverlay/>
        </div> */}

      <div className="profile-grid-container" >
      {isLikedPostIDListLoaded && personalPosts.map((post)=> { 
              // Posts are rendered only after the likedPostIDList and listOfFollowedEmails are loaded to ensure 
              // the heart icon is filled/empty depending on whether the user has previous liked the post
              // and to ensure the follow/unfollow button is shown depending on whether the user has previously followed the user
                return (
                  <PostElement 
                    postObject={post} 
                    userEmail={user?.userEmail}
                    userName={user?.userName} 
                    isPostLikedParam={likedPostIDList.some(likedPost => likedPost.postID === post?.postID)} 
                    isGridLayout={true}
                    deletePost={deletePost}
                    isPosterFollowedParam={false}
                    key={post?.postID}
                  />
                )
      })}
      </div>
    </div>
    )
  );
}

export default Profile;
