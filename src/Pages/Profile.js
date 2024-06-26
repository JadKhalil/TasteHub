import React, { useState, useEffect} from "react";
import { useUser } from "../UserContext";
import {loadPersonalPosts, loadLikedPostIDList, loadUserInfo} from "../Api";
import "./Profile.css";
import PostElement from "../Elements/PostElement";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin, googleLogout } from "@react-oauth/google";
import CreateButton from "../Elements/CreateButton";
import { FaCamera } from "react-icons/fa";
import CreatePostOverlay from "../Elements/CreatePostOverlay";


/**
 * JSX Component for the Profile page.
 * 
 * Loads personal posts in a grid layout
 * 
 * @returns {JSX}
 */
function Profile() {
  const [ personalPosts, setPersonalPosts ] = useState([]); // list of all personal posts
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user"))); // current loged-in user
  const { user: contextUser, login, logout } = useUser();
  const [ likedPostIDList, setLikedPostIDList ] = useState([]); // list of IDs of posts the user has liked
  const [ showPostCreate, setPostCreate] = useState(false);
  const navigate = useNavigate();

  /* 
   * initially set to false as the list of likedPostIDs take time to load from the database.
   * This hook is here to ensure the post is loaded AFTER all the liked post IDs are found in the database.
   * Without this hook, there may be bugs where heart icon of the rendered post is hollow despite the fact that the user has previously
   * liked the post. 
   */ 
  const [isLikedPostIDListLoaded, setIsLikedPostIDListLoaded ] = useState(false); 
  
  const toggleCreatePostOverlay = () => {
    setPostCreate(!showPostCreate);
  };


  // basic function calls when we are checking button click
  const toggleEditMode = () => {
    navigate('/settings');
  }

  const handlePostDelete = (deletedPostId) => {
    // Update local state to remove the deleted post
    setPersonalPosts((prevPosts)=> prevPosts.filter(post => post.postID !== deletedPostId));

    const userWithUpdatedNumberOfPosts = {
      bio: user.bio,
      creationDate: user.creationDate,
      image: user.image,
      numberOfFollowers: user.numberOfFollowers,
      numberOfFollowing: user.numberOfFollowing,
      numberOfPosts: Number(user.numberOfPosts) - 1,
      userEmail: user.userEmail,
      userName: user.userName
    }
    setUser(userWithUpdatedNumberOfPosts);
  };

  const handlePostCreation = (newPostObject) => {
    setPersonalPosts([newPostObject, ...personalPosts]); // Update local state to add the new post
    const userWithUpdatedNumberOfPosts = {
      bio: user.bio,
      creationDate: user.creationDate,
      image: user.image,
      numberOfFollowers: user.numberOfFollowers,
      numberOfFollowing: user.numberOfFollowing,
      numberOfPosts: Number(user.numberOfPosts) + 1,
      userEmail: user.userEmail,
      userName: user.userName
    }

    setUser(userWithUpdatedNumberOfPosts);
  }
  // When the user data is fetched, the loadLikedPostIDList, loadListOfFollowing, and loadPersonalPosts functions are called
  // This is to ensure that the posts are rendered after all the liked post is returned
  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const likedPostArray = await loadLikedPostIDList(user.userEmail);
        const postsArray = await loadPersonalPosts(user.userEmail);
        setPersonalPosts(postsArray);
        setLikedPostIDList(likedPostArray);
        setIsLikedPostIDListLoaded(true);
      }
    };
  
    fetchData();

    // The dependency array ensures that this effect runs whenever user changes
  }, [user]);

  // When the page is refreshed, the loadUserInfo function is called
  // This is to ensure that the most updated user information is fetched upon refresh
  useEffect(()=> {
    const fetchData = async () => {
      const returnData = await loadUserInfo(user.userEmail);
      setUser(returnData.userInfo);
      localStorage.setItem("user", JSON.stringify(returnData.userInfo));
    };
  
    fetchData();
  }, []) // The dependency array ensures that this effect runs whenever the page refreshes

  const logOut = () => {
    googleLogout();
    localStorage.removeItem("user");
    // Remove the settings from localStorage upon logout
    localStorage.removeItem("settings");
    logout();
    setUser(null);
    navigate("/");
  };

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
            <div className="name-container">
              {user.userName}
            </div>
            <div className="editprofile-div">
              <button className="editprofile-button" onClick={toggleEditMode}>Edit profile</button>
            </div>

            <div className="logoutprofile-div"> 
              <button className="logoutprofile-button"
              onClick={logOut}>
                Log Out
              </button>
            </div>
          </div>
          <div className="Follwer-FollowingDisplay">
            <div className="profilePosts">{user.numberOfPosts} Posts</div>
            <div className="profilefollowers">{user.numberOfFollowers} Followers</div>
            <div className="profilefollowing">{user.numberOfFollowing} Following</div>
          </div>
          <div className="bio-information-container">
            <p>
              {user.bio}
            </p>
          </div>
        </div>
      </div>
      <div className="profile-tab-container">
        <div>
        {personalPosts.length === 0 ? (
          <div className="emptyProfileContainer">
            <div className="profilePostEmptyContainer">
              <FaCamera className="profilePostsCameraIcon" />
            </div>
            <div className="profileShareRecepiesContainer">
              <div className="profileShareRecepies-div">Share Recipes</div>
              <div className="profileShareRecepiesInfo-div">
                When you share photos, they will appear on your profile.
              </div>
            </div>
            <div className="profileShareRecepiePrompt-div">
              <button
                className="profileShareRecepiePrompt-button"
                onClick={toggleCreatePostOverlay}
              >
                Share your first recipe
              </button>
            {showPostCreate && <CreatePostOverlay setPostCreate={setPostCreate} renderNewPost={handlePostCreation}/>}
            </div>
          </div>
        ) : (
          <>
            <CreateButton renderNewPost={handlePostCreation}/>
            <div className="profile-grid-container">
              {isLikedPostIDListLoaded && personalPosts.map((post) => (
                  <PostElement 
                    postObject={post} 
                    userEmail={user?.userEmail}
                    userName={user?.userName} 
                    isPostLikedParam={likedPostIDList.some(likedPost => likedPost.postID === post?.postID)} 
                    isGridLayout={true}
                    isPosterFollowedParam={false}
                    onDelete={handlePostDelete}
                    key={post?.postID}
                  />
              ))}
            </div>
          </>)}
        </div>
      </div>
    </div>
    )
  );
}

export default Profile;
