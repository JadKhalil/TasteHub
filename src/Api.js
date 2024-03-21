/**
 * Calls the 'delete_post' lambda function to remove the post from the database.
 * Removes the deleted post from allPosts list
 *
 * @param {String} postID           postID of the post
 * @param {String} posterUserEmail  userEmail of the poster
 */
export const deletePost = async (postID, posterUserEmail) => {
  try {
    const response = await fetch(
      `https://fbn3kgu4tkf52n3vkqw27qhx4m0xdyob.lambda-url.ca-central-1.on.aws?postID=${postID}&userEmail=${posterUserEmail}`, // Lambda Function URL (needs to be hard coded)
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
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

  /**
 * Calls the 'get_all_posts' lambda function to fetch all the posts in the application.
 * Sorts the returned data based on the date posted and returns it.
 * @return {Array}    Returns an array of all posts
 */
  export const loadAllPosts = async () => {
  const res = await fetch(
    "https://3l4lzvgaso73rkupogicrcwunm0voagl.lambda-url.ca-central-1.on.aws/", // Lambda Function URL (needs to be hard coded)
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  console.log("load all posts request called");
  const jsonRes = await res.json();
  if (res.status === 200) {
    // the post list items are ordered by submit time
    jsonRes?.postList?.Items?.sort((a, b) => {
      if (a["datePosted"] > b["datePosted"]) {
        return -1;
      }
      if (a["datePosted"] < b["datePosted"]) {
        return 1;
      }
      return 0;
    });

    return [...jsonRes?.postList?.Items];
  } else {
    window.alert(`Error! status ${res.status}\n${jsonRes["message"]}`);
  }
};


/**
 * Calls the 'get_user_liked_posts' lambda function to fetch the IDs of all the posts the user has previously liked.
 * @param {String} userEmail    Email of the user
 * @return {Array}              Returns an array of user's liked post id list
 */
export const loadLikedPostIDList = async (userEmail) => {
  const res = await fetch(
    `https://fmepbkghyequf22cdhtoerx7ui0gtimv.lambda-url.ca-central-1.on.aws?userEmailOfLiker=${userEmail}`, // Lambda Function URL (needs to be hard coded)
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  console.log("load liked post id request called");
  const jsonRes = await res.json();
  if (res.status === 200) {
    return [...jsonRes?.likeList?.Items];
  } else {
    window.alert(`Error! status ${res.status}\n${jsonRes["message"]}`);
  }
};


/**
 * Calls the 'get_following' lambda function to fetch the emails of all the users the user has previously followed.
 * @param {String} userEmail    Email of the user
 * @return {Array}              Returns an array of email of followed users
 */
export const loadListOfFollowing = async (userEmail) => {
  const res = await fetch(
    `https://wzw3w4ygt7nrso37nmtlul6fpi0hrmbe.lambda-url.ca-central-1.on.aws/?userEmail=${userEmail}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  console.log("load list of following request called");
  const jsonRes = await res.json();
  if (res.status === 200) {
    return [...jsonRes?.followList?.Items];
  } else {
    window.alert(`Error! status ${res.status}\n${jsonRes["message"]}`);
  }
};


/**
 * Calls the 'get_following_posts' lambda function to fetch all the posts from followed users.
 * Sorts the returned data based on the date posted and returns it.
 * @param {String} userEmail  Email of the user
 * @return {Array}            Returns an array of all posts from following users
 */
export const loadCateredPosts = async (userEmail) => {
 const res = await fetch(
   `https://ncvpqlzqzobltjs6xbdwjtw2iy0whsun.lambda-url.ca-central-1.on.aws?userEmail=${userEmail}`, // Lambda Function URL (needs to be hard coded)
   {
     method: "GET",
     headers: {
       "Content-Type": "application/json",
     },
   }
 );
 console.log("load catered posts requst called");
 const jsonRes = await res.json();
 if (res.status === 200) {
   // the post list items are ordered by submit time
   jsonRes?.postList?.Items?.sort((a, b) => {
     if (a["datePosted"] > b["datePosted"]) {
       return -1;
     }
     if (a["datePosted"] < b["datePosted"]) {
       return 1;
     }
     return 0;
   });
   return [...jsonRes?.postList?.Items];
 } else {
   window.alert(`Error! status ${res.status}\n${jsonRes["message"]}`);
 }
};


/**
 * Calls the 'get_personal_posts' lambda function to fetch all the posts in the application.
 * Sorts the returned data based on the date posted and returns it.
 * @param {String} userEmail  Email of the user
 * @return {Array}            Returns an array of all personal posts
 */
export const loadPersonalPosts = async (userEmail) => {
  const res = await fetch(
    `https://2pkenopomdasergcizbgniu25y0prrhp.lambda-url.ca-central-1.on.aws?userEmail=${userEmail}`, // Lambda Function URL (needs to be hard coded)
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

    return [...jsonRes?.postList?.Items];
  }
  else
  {
    window.alert(`Error! status ${res.status}\n${jsonRes["message"]}`);
  }
}