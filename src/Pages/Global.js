import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PostElement from "../Elements/PostElement";
import "./Global.css";

function Global() {

  const [ allPosts, setAllPosts ] = useState([]);

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
      // the obituary items are ordered by submit time
      jsonRes?.postList?.Items.sort((a, b) => {
        if (a['datePosted'] > b['datePosted']) {
          return -1;
        }
        if (a['datePosted'] < b['datePosted']) {
          return 1;
        }
        return 0;
      });

      setAllPosts([...jsonRes["postList"]["Items"]]);
    }
    else
    {
      window.alert(`Error! status ${res.status}\n${jsonRes["message"]}`);
    }
  }

  useEffect(()=> {
    loadAllPosts();
  },[]);

  console.log(allPosts);

  return (
    <div className="global-container">
      <h1>Global</h1>
      {allPosts.map((post)=> {
        return (<PostElement postObject={post} key={post?.postID}/>)
      })}
    </div>
  );
}

export default Global;
