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
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold mb-8">TasteHub Startup</h1>
      {!user && <Login />}
      {user && <SideBar />}
    </div>
  );
}

export default LoginStartup;
