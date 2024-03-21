import React, { useState, useEffect } from "react";
import {loadAllPosts, deletePost, loadLikedPostIDList, loadListOfFollowing} from "../Api";
import { useUser } from "../UserContext";
import PostElement from "../Elements/PostElement";
import "./Search.css";
import { useDarkMode } from "./DarkModeContext";

/**
 * JSX Component for the Search page.
 *
 * Loads all posts in a grid layout. There is also a search functionality
 *
 * @returns {JSX}
 */
function Search() {
  const [allPosts, setAllPosts] = useState([]); // list of all posts
  const { user } = useUser(); // Details of signed in user including their email
  const [likedPostIDList, setLikedPostIDList] = useState([]); // list of IDs of posts the user has liked
  const [followedUserEmailList, setFollowedUserEmailList] = useState([]); // list of email of other users the user follows

  const { isDarkMode } = useDarkMode();
  /*
   * initially set to false as the list of likedPostIDs take time to load from the database.
   * This hook is here to ensure the post is loaded AFTER all the liked post IDs are found in the database.
   * Without this hook, there may be bugs where heart icon of the rendered post is hollow despite the fact that the user has previously
   * liked the post.
   */
  const [isLikedPostIDListLoaded, setIsLikedPostIDListLoaded] = useState(false);

  /*
   * initially set to false as the list of followedUserEmails take time to load from the database.
   * This hook is here to ensure the post is loaded AFTER all the followed emails are found in the database.
   * Without this hook, there may be bugs where follow button of the rendered post says "follow" despite the fact that the user has previously
   * followed the user
   */
  const [isFollowedUserEmailListLoaded, setIsFollowedUserEmailListLoaded] = useState(false);

  const [searchFilter, setSearchFilter] = useState("recipeName"); // Filters the search result by this attribute
  const [searchQuery, setSearchQuery] = useState(""); // Search bar entry

  let filteredPosts = allPosts.filter((post) =>
    post[searchFilter]?.toLowerCase().includes(searchQuery.toLowerCase())
  );


  // When the user data is fetched, the loadLikedPostIDList, loadListOfFollowing, and loadAllPosts functions are called
  // This is to ensure that the posts are rendered after all the liked post is returned
  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const likedPostArray = await loadLikedPostIDList(user.userEmail);
        const followingArray = await loadListOfFollowing(user.userEmail);
        const postsArray = await loadAllPosts();
        setAllPosts(postsArray);

        setLikedPostIDList(likedPostArray);
        setIsLikedPostIDListLoaded(true);
        setFollowedUserEmailList(followingArray);
        setIsFollowedUserEmailListLoaded(true);
      }
      
    };
  
    fetchData();

    // The dependency array ensures that this effect runs whenever user changes
  }, [user]);

  return (
    user && (
      <div className="search-container">
        <div className="search-header-container">
          <h1>Search</h1>
          <div className="search-bar-container">
            <select
              id="search-filter"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
            >
              <option value="recipeName">Recipe Name</option>
              <option value="category">Category</option>
              <option value="userName">Username</option>
            </select>
            <input
              type="text"
              className="search-bar"
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            ></input>
          </div>
        </div>
      
        <div className="search-grid-container" >
          {isLikedPostIDListLoaded && isFollowedUserEmailListLoaded && filteredPosts.map((post)=> {
              // Posts are rendered only after the likedPostIDList is loaded to ensure the heart icon is filled/empty depending on
              // whether the user has previous liked the post
              return (<PostElement 
                      postObject={post} 
                      userEmail={user?.userEmail} 
                      userName={user?.userName}
                      isPostLikedParam={likedPostIDList.some(likedPost => likedPost.postID === post?.postID)} 
                      isGridLayout={true}
                      deletePost={deletePost}
                      isPosterFollowedParam={followedUserEmailList.some(followed => followed.userEmailOfFollowee === post?.userEmail)}
                      key={post?.postID}/>)
          })}
        </div>
      </div>
    )
  );
}

export default Search;
