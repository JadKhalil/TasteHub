// Login.js
import React, { useState, useEffect } from "react";
import { useGoogleLogin, googleLogout } from "@react-oauth/google";
import axios from "axios";
import { useUser } from "../UserContext";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from 'uuid';

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

  const createUserProfile = async (email, newUserName, newBio, creationDate, picture) => {
    const dataToSubmit = new FormData();
    dataToSubmit.append("userEmail", email);
    dataToSubmit.append("userName", newUserName);
    dataToSubmit.append("bio", newBio);
    dataToSubmit.append("numberOfFollowers", 0);
    dataToSubmit.append("numberOfFollowing", 0);
    dataToSubmit.append("creationDate", creationDate);
    dataToSubmit.append("profile picture", picture);

    const promise = await fetch(
        "https://hqp3zbqf4uunvhiunkf3ttpvgi0euppk.lambda-url.ca-central-1.on.aws/", // Lambda Function URL (needs to be hard coded)
        {
            method: "POST",
            body: dataToSubmit,
        }
    );
  }


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
          const { name, email, picture } = res.data; // Google login information

          (async () => {
            const profileRes = await fetch(
              `https://ue2qthlxc7fiit4ocgnu7ko4d40sndti.lambda-url.ca-central-1.on.aws?userEmail=${email}`,
              {
                  method: "GET",
                  headers: {
                      "Content-Type": "application/json"
                  },
              }
            )
            const jsonRes = await profileRes.json();
            const profileStatus = profileRes.status;
            const userInfo = jsonRes?.userInfo?.Items[0];
            if (profileStatus === 200) { // Profile exists
              const existingUserData = {
                ...userInfo
              };
              console.log(userInfo);

              setUser(existingUserData);
              login(existingUserData);
              localStorage.setItem("user", JSON.stringify(existingUserData));
              navigate("/");
            }
            else if (profileStatus === 404) { // Profile doesn't exist
              const newUserName = name + "-" + uuidv4().slice(0, 6);
              const newBio = "No bio yet";
              const creationDate = Date.now();
                
              createUserProfile(email, newUserName, newBio, creationDate, picture); // POST Request function

              const newUserData = {
                "userEmail": email,
                "userName": newUserName,
                "bio": newBio,
                "numberOfFollowers": Number(0),
                "numberOfFollowing": Number(0),
                "creationDate": creationDate,
                "image": picture
              };

              setUser(newUserData);
              login(newUserData);
              localStorage.setItem("user", JSON.stringify(newUserData));
              navigate("/");
            }
            else { // Other error
              window.alert("Error with logging in");
            }
          })()
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
        .catch((err) => console.log(err)); // Google Login error error handling
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
        <button className="startup-button" onClick={() => loginWithGoogle()}>
          Sign In
        </button>
      )}
    </div>
  );
}

export default Login;
