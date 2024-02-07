import React from "react";
import { useUser } from "./UserContext";
import Login from "./Login";
import SideBar from "./SideBar";
import { useNavigate } from "react-router-dom";

function LoginStartup() {
  const { user } = useUser();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      navigate("/global");
    }
  }, [user, navigate]);

  return (
    <div className="startup-screen">
      <h1 className="startup-text">TasteHub Startup</h1>
      {!user && <Login />}
      {user && <SideBar />}
    </div>
  );
}

export default LoginStartup;
