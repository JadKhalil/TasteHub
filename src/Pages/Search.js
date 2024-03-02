import React, {useState, useEffect} from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useUser } from "../UserContext";
import PostElement from "../Elements/PostElement";
import "./Search.css";


function Search() {
  const [ allPosts, setAllPosts ] = useState([]); // list of all posts
  const { user } = useUser(); // Details of signed in user including their email
  const [ likedPostIDList, setLikedPostIDList ] = useState([]); // list of IDs of posts the user has liked
  const [searchFilter, setSearchFilter] = useState('recipeName'); // Filters the search result by a certain attribute
  const [searchQuery, setSearchQuery] = useState(''); // Search bar entry

  // initially the likedpostID is not listed. 
  // This hook is here to ensure the post is loaded AFTER all the liked post IDs are found in the database
  const [isLikedPostIDListLoaded, setIsLikedPostIDListLoaded ] = useState(false); 

  let filteredPosts = allPosts.filter((post) => post[searchFilter]?.toLowerCase().includes(searchQuery.toLowerCase()));

  
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

export default Search;
