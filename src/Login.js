// Login.js
import React, { useState, useEffect } from "react";
import { useGoogleLogin, googleLogout } from "@react-oauth/google";
import axios from "axios";
import { useUser } from "./UserContext";
import { useNavigate } from "react-router-dom";

function Login() {
  const { user: contextUser, login, logout } = useUser();
  const [user, setUser] =  useState(contextUser);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const loginWithGoogle = useGoogleLogin({
    onSuccess: (codeResponse) => {
      axios
        .get(
          `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${codeResponse.access_token}`,
          {
            headers: {
              Authorization: `Bearer ${codeResponse.access_token}`,
              Accept: "application/json",
            },
          }
        )
        .then((res) => {
          const userData = res.data;
          setUser(userData);
          login(userData);
          localStorage.setItem("user", JSON.stringify(userData));
        })
        .catch((err) => console.log(err));
    },
    onError: (error) => console.log("Login Failed:", error),
  });

  const logOut = () => {
    googleLogout();
    localStorage.removeItem("user");
    logout();
    setUser(null);
    navigate("/");
  };

  return (
    <div>
      {user ? (
        <div>
          <img src={user.picture} alt="user image" />
          <h3>User Logged in</h3>
          <p>Name: {user.name}</p>
          <p>Email Address: {user.email}</p>
          <button onClick={logOut}>Log out</button>
        </div>
      ) : (
        <button onClick={loginWithGoogle}>Sign In To The Hub! </button>
      )}
    </div>
  );
}

export default Login;
