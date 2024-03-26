import CreatePostOverlay from "../../Elements/CreatePostOverlay";
import { useState, useEffect } from "react";
import { FaCamera } from "react-icons/fa";
import CreateButton from "../../Elements/CreateButton";
import { useUser } from "../../UserContext";
import PostElement from "../../Elements/PostElement";
import "../Profile.css";

function Posts({isLikedPostIDListLoaded}) {
  const [showPostCreate, setPostCreate] = useState(false);
  const [ personalPosts, setPersonalPosts ] = useState([]); // list of all personal posts

  const [ likedPostIDList, setLikedPostIDList ] = useState([]); // list of IDs of posts the user has liked
  const { user } = useUser(); // Details of signed in user including their email


  /* 
   * initially set to false as the list of likedPostIDs take time to load from the database.
   * This hook is here to ensure the post is loaded AFTER all the liked post IDs are found in the database.
   * Without this hook, there may be bugs where heart icon of the rendered post is hollow despite the fact that the user has previously
   * liked the post. 
   */ 
  const toggleCreatePostOverlay = () => {
    setPostCreate(!showPostCreate);
  };
  
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

  // When the user data is fetched, the loadLikedPostIDList, loadListOfFollowing, and loadPersonalPosts functions are called
  // This is to ensure that the posts are rendered after all the liked post is returned
  useEffect(() => {
    if (user) {
      //loadLikedPostIDList();
      loadPersonalPosts();
    }
    // The dependency array ensures that this effect runs whenever user changes
  }, [user]);

  return (
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
          {showPostCreate && <CreatePostOverlay setPostCreate={setPostCreate} />}
          </div>
        </div>
      ) : (
        <>
          <CreateButton />
          <div className="profile-grid-container">
            {personalPosts.map((post) => (
              <div key={post?.postID}>
                <PostElement 
                  postObject={post} 
                  userEmail={user?.userEmail}
                  userName={user?.userName} 
                  isPostLikedParam={likedPostIDList.some(likedPost => likedPost.postID === post?.postID)} 
                  isGridLayout={true}
                  deletePost={deletePost}
                  isPosterFollowedParam={false}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
export default Posts;