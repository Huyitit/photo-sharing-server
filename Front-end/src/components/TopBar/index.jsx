import React, { useEffect, useState, useRef } from "react";
import { useLocation, matchPath, useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Checkbox, FormControlLabel } from "@mui/material";
import fetchModel from "../../lib/fetchModelData";
import "./styles.css";

function TopBar({ loggedInUser, setLoggedInUser, advancedFeatures, setAdvancedFeatures, triggerUserListUpdate }) {
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
  const uploadInputRef = useRef(null);

  useEffect(() => {
    if (!loggedInUser) {
      setDisplayText("Please Login");
      return;
    }
    const path = location.pathname;
    const match = matchPath('/users/:userId', path) || 
                  matchPath('/photos/:userId', path) || 
                  matchPath('/photos/:userId/:photoId', path) || 
                  matchPath('/comments/:userId', path);
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
          else if(match.pathname.split('/')[1] === "comments")
          {
            setDisplayText("Comments of " + user.first_name + " " + user.last_name);
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

  const handleAddPhotoClick = (e) => {
    e.preventDefault();
    uploadInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('photo', file);

    try {
      // Use standard fetch because we need FormData and credentials
      const res = await fetch("http://localhost:8081/photos/new", {
        method: "POST",
        body: formData,
        credentials: "include"
      });

      if (res.ok) {
        alert("Photo uploaded successfully!");
        
        // Cập nhật số lượng ảnh bằng cách gọi hàm trigger từ App.js (Giải pháp 2)
        if (triggerUserListUpdate) {
          triggerUserListUpdate();
        }

        // Navigate to the user's own photos to see the new photo
        navigate(`/photos/${loggedInUser._id}`);
      } else {
        alert("Failed to upload photo");
      }
    } catch (err) {
      console.error("Upload error", err);
    }
    
    // Clear the input so the same file can be uploaded again if needed
    e.target.value = null;
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
          <>
            {/* Advanced Features Checkbox */}
            <FormControlLabel
              control={
                <Checkbox 
                  checked={advancedFeatures} 
                  onChange={(e) => setAdvancedFeatures(e.target.checked)} 
                  style={{ color: 'white' }} 
                />
              }
              label="Enable Advanced Features"
              style={{ marginLeft: 16 }}
            />
            
            <Button color="inherit" onClick={handleAddPhotoClick} style={{ marginLeft: 16 }}>
              Add Photo
            </Button>
            <input 
              type="file" 
              accept="image/*" 
              ref={uploadInputRef} 
              style={{ display: "none" }} 
              onChange={handleFileChange} 
            />
            <Button color="inherit" onClick={handleLogout} style={{ marginLeft: 16 }}>
              Logout
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;