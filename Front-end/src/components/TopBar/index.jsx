import React, { useEffect, useState } from "react";
import { useLocation, matchPath, useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import fetchModel from "../../lib/fetchModelData";
import "./styles.css";

function TopBar({ loggedInUser, setLoggedInUser }) {
    /*
  Besides these components, you need to update the TopBar component in components/TopBar as follows:
  --The left side of the TopBar should have your name.
  The right side of the TopBar should provide app context by reflecting what is being shown in the main content region. 
  For example, 
  if the main content is displaying details on a user, the TopBar should have the user's name. 
  If it is displaying a user's photos it should say "Photos of " and the user's name.
  */
  // const [displayText, setDisplayText] = useState("Photo Sharing App");
  const location = useLocation();
  const [displayText, setDisplayText] = useState("Photo Sharing App");
  const navigate = useNavigate();

  useEffect(() => {
    if (!loggedInUser) {
      setDisplayText("Please Login");
      return;
    }
    const path = location.pathname;
    const match = matchPath('/users/:userId', path) || matchPath('/photos/:userId', path);
    if(match){
      const userId = match.params.userId;
      fetchModel("/user/" + userId)
        .then((user) => {
          if(match.pathname.split('/')[1] === "users")
          {
            setDisplayText(user.first_name + " " + user.last_name);
          }
          else if(match.pathname.split('/')[1] === "photos")
          {
            setDisplayText("Photos of " + user.first_name + " " + user.last_name);
          }
        })
        .catch((err) => console.error("Error fetching user:", err));
    } else {
      setDisplayText("Photo Sharing App");
    }
  }, [location, loggedInUser]);

  const handleLogout = async () => {
    try {
      await fetchModel("/admin/logout", { method: "POST" });
    } catch (err) {
      console.error("Failed to logout", err);
    }
    setLoggedInUser(null);  
    navigate("/login-register");
  };

  return (
    <AppBar className="topbar-appBar" position="absolute">
      <Toolbar>
        <Typography variant="h5" color="inherit">
          <a href="/">Huy Cao</a>
          {loggedInUser ? ` | Hi ${loggedInUser.first_name}` : " | Please Login"}
        </Typography>
        <Typography variant="h5" color="inherit" marginLeft="auto">
          {displayText}
        </Typography>
        {loggedInUser && (
          <Button color="inherit" onClick={handleLogout} style={{ marginLeft: 16 }}>
            Logout
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;