import React, { useEffect, useState } from "react";
import {loadCateredPosts, loadLikedPostIDList, loadListOfFollowing} from "../Api";
import PostElement from "../Elements/PostElement";
import { useUser } from "../UserContext";
import "./Global.css";
import CreateButton from "../Elements/CreateButton";

/**
 * JSX Component for the global page.
 *
 * Loads catered posts in a scrollable layout
 *
 * @returns {JSX}
 */
function Catered() {
  const [cateredPosts, setCateredPosts] = useState([]); // list of catered posts
  const { user } = useUser(); // Details of signed in user including their email
  const [likedPostIDList, setLikedPostIDList] = useState([]); // list of IDs of posts the user has liked
  const [followedUserEmailList, setFollowedUserEmailList] = useState([]); // list of email of other users the user follows

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


  // When the user data is fetched, the loadLikedPostIDList, loadListOfFollowing, and loadCateredPosts functions are called
  // This is to ensure that the posts are rendered after all the liked post is returned
  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const likedPostArray = await loadLikedPostIDList(user.userEmail);
        const followingArray = await loadListOfFollowing(user.userEmail);
        const postsArray = await loadCateredPosts(user.userEmail);
        setCateredPosts(postsArray);
        setLikedPostIDList(likedPostArray);
        setIsLikedPostIDListLoaded(true);
        setFollowedUserEmailList(followingArray);
        setIsFollowedUserEmailListLoaded(true);
      }
    };
  
    fetchData();

    // The dependency array ensures that this effect runs whenever user changes
  }, [user]);

  const handlePostDelete = (deletedPostId) => {
    // Update local state to remove the deleted post
    setCateredPosts((prevPosts)=> prevPosts.filter(post => post.postID !== deletedPostId));
  };

  return (
    user && (
      <div className="global-big-box">
        <div className="global-box">
          <div className="global-header-big-box">
            <div className="global-header-box">
              <div className="emptyspace">
                <CreateButton/>
              </div>
              <h1 className="global-header-label-h1">Catered</h1>
              <div className="addPostButton">
                <CreateButton/>
              </div>
            </div>
          </div>

          <div className="global-post-list-big-box">
            <div className="global-post-list-box">
              {isLikedPostIDListLoaded &&
                isFollowedUserEmailListLoaded &&
                cateredPosts.map((post) => {
                  // Posts are rendered only after the likedPostIDList is loaded to ensure the heart icon is filled/empty depending on
                  // whether the user has previous liked the post
                  return (
                    <PostElement
                      postObject={post}
                      userEmail={user?.userEmail}
                      userName={user?.userName}
                      isPostLikedParam={likedPostIDList.some(
                        (likedPost) => likedPost.postID === post?.postID
                      )}
                      isGridLayout={false}
                      isPosterFollowedParam={followedUserEmailList.some(
                        (followed) =>
                          followed.userEmailOfFollowee === post?.userEmail
                      )}
                      onDelete={handlePostDelete}
                      key={post?.postID}
                    />
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    )
  );
}

export default Catered;
