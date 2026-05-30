import React, { useEffect, useState } from "react";
import { useLocation, matchPath} from "react-router-dom";
import { AppBar, Toolbar, Typography } from "@mui/material";
import fetchModel from "../../lib/fetchModelData";
import "./styles.css";

function TopBar() {
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
  // const [data, setData] = useState(null)
  
  useEffect(()=>{
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
    }
  }, [location]);
  return (
    <AppBar className="topbar-appBar" position="absolute">
      <Toolbar>
        <Typography variant="h5" color="inherit">
          <a href="/">Huy Cao</a>
        </Typography>
        <Typography variant="h5" color="inherit" marginLeft="auto">
          {displayText}
        </Typography>
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;