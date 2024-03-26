import { useUser } from "../../UserContext";
import PostElement from "../../Elements/PostElement";
import { useState, useEffect } from "react";

function Liked({likedPostIDList}) {

    const { user } = useUser(); // Details of signed in user including their email

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
            
          } else {
            // Error handling for unsuccessful deletion
            window.alert("Failed to delete post");
          }
        } catch (error) {
          console.error("Error deleting post:", error);
          window.alert("An error occurred while deleting the post");
        }
      };
    
    

    return (
        <div className="profile-grid-container">
            {console.log(likedPostIDList)}
            {likedPostIDList.map((post) => (
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
    )
}

export default Liked;