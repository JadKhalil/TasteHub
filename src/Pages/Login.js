// Login.js
import React, { useState, useEffect } from "react";
import { useGoogleLogin, googleLogout } from "@react-oauth/google";
import axios from "axios";
import { useUser } from "../UserContext";
import { useNavigate } from "react-router-dom";

function Login() {
  const { user: contextUser, login, logout } = useUser();
  const [user, setUser] = useState(contextUser);
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
          const { name, email, picture } = res.data;
          const userData = { name, email, picture}; //init userData with only the name, email, and picture URL from google

          /*
          * get the profile from backend here (get_profile lambda url)
          * if DNE set defaulkt values.
          */

          // Check if user profile exists in the database
          axios.get(`https://your-lambda-function-url/userProfile?userEmail=${userData.email}`) //replace lambda url
            .then((profileRes) => {
              const { statusCode, body } = profileRes.data;
              if (statusCode === 200) {
                // User profile exists, load profile into localStorage
                const { bio, numberOfFollowers, numberOfFollowing, creationDate, picture } = profileRes.data;
                
                //replace profile picture
                userData.picture = picture;
                
                //add existing data
                const existingUserData = {
                  ...userData,
                  bio,
                  numberOfFollowers,
                  numberOfFollowing,
                  creationDate,
                };

                setUser(existingUserData);
                login(existingUserData);
                localStorage.setItem("user", JSON.stringify(existingUserData));
                navigate("/");
              } else if (statusCode === 404) {
                // User profile not found, set default values and load profile into localStorage
                const defaultUserData = {
                  ...userData,
                  followers: 0,
                  following: 0,
                  bio: "Default Bio",
                };
                setUser(defaultUserData);
                login(defaultUserData);
                localStorage.setItem("user", JSON.stringify(defaultUserData));
                navigate("/");
              } else {
                console.error("Error fetching user profile:", body);
              }
            })
            .catch((profileErr) => console.error("Error fetching user profile:", profileErr));

  
          // Check if settings already exist in localStorage, initialize if not
          if (!localStorage.getItem("settings")) {
            const defaultSettings = {
              colourTheme: "Light-Mode",
              favoriteFood: "Carnivore",
            };
            localStorage.setItem("settings", JSON.stringify(defaultSettings));
          }
  
          navigate("/");
        })
        .catch((err) => console.log(err));
    },
    onError: (error) => console.log("Login Failed:", error),
  });
  

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
        <button className="startup-button" onClick={loginWithGoogle}>
          Sign In
        </button>
      )}
    </div>
  );
}

export default Login;
