import React, {useState, useEffect} from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useUser } from "../UserContext";
import PostElement from "../Elements/PostElement";
import "./Search.css";

/**
 * JSX Component for the Search page.
 * 
 * Loads all posts in a grid layout. There is also a search functionality
 * 
 * @returns {JSX}
 */
function Search() {
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
  const [searchFilter, setSearchFilter] = useState('recipeName'); // Filters the search result by this attribute
  const [searchQuery, setSearchQuery] = useState(''); // Search bar entry

  let filteredPosts = allPosts.filter((post) => post[searchFilter]?.toLowerCase().includes(searchQuery.toLowerCase()));

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
   */
    const deletePost = async (postID) => {
      try {
        const response = await fetch(
          `https://your-backend-url/api/delete_post`, // Replace with your actual backend endpoint
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              postID: postID,
              // Add any other necessary data that your backend requires for post deletion
            })
          }
        );
  
        if (response.ok) {
          window.alert("Post deleted successfully");
          setAllPosts((prevAllPosts) => prevAllPosts.filter((post) => post?.id !== postID)); // removes the post from the AllPosts list
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
    <div className="search-container">
      <div className="search-header-container">
        <h1>Global</h1>
        <div className="search-bar-container">
          <select id="search-filter" value={searchFilter} onChange={(e) => setSearchFilter(e.target.value)}>
            <option value="recipeName">Recipe Name</option>
            <option value="category">Category</option>
            <option value="userEmail">User Email</option>
          </select>
          <input type="text" className="search-bar" placeholder="Search recipes..." value={searchQuery} onChange={(e)=>setSearchQuery(e.target.value)}></input>
        </div>
      </div>

      <div className="search-grid-container" >
        {isLikedPostIDListLoaded && filteredPosts.map((post)=> {
            // Posts are rendered only after the likedPostIDList is loaded to ensure the heart icon is filled/empty depending on
            // whether the user has previous liked the post
            return (<PostElement 
                    postObject={post} 
                    userEmail={user?.email} 
                    isPostLikedParam={likedPostIDList.some(likedPost => likedPost.postID === post?.postID)} 
                    isGridLayout={true}
                    deletePost={deletePost}
                    key={post?.postID}/>)
        })}
      </div>
    </div>
  );
}

export default Search;
