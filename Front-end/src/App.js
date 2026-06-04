import './App.css';

import React, { useState } from "react";
import { Grid, Typography, Paper } from "@mui/material";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";

import TopBar from "./components/TopBar";
import UserDetail from "./components/UserDetail";
import UserList from "./components/UserList";
import UserPhotos from "./components/UserPhotos";
import UserComments from "./components/UserComments";
import LoginRegister from "./components/LoginRegister";

const App = (props) => {
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [advancedFeatures, setAdvancedFeatures] = useState(false); // Problem 5

  // THÊM VÀO ĐÂY: State trigger để làm mới UserList (Giải pháp 2)
  const [updateUserListTrigger, setUpdateUserListTrigger] = useState(0);

  // THÊM VÀO ĐÂY: Hàm gọi để kích hoạt update (Giải pháp 2)
  const triggerUserListUpdate = () => {
    setUpdateUserListTrigger((prev) => prev + 1);
  };

  React.useEffect(() => {
    const checkSession = async () => {
      try {
        const fetchModel = require("./lib/fetchModelData").default;
        const user = await fetchModel("/admin/check");
        setLoggedInUser(user);
      } catch (err) {
        setLoggedInUser(null);
      } finally {
        setIsCheckingSession(false);
      }
    };
    checkSession();
  }, []);

  if (isCheckingSession) {
    return <Typography>Loading application...</Typography>;
  }

  return (
      <Router>
        <div>
          <Grid container xs={20} spacing={2}>
            <Grid item xs={12}>
              <TopBar 
                loggedInUser={loggedInUser} 
                setLoggedInUser={setLoggedInUser} 
                advancedFeatures={advancedFeatures}
                setAdvancedFeatures={setAdvancedFeatures}
                triggerUserListUpdate={triggerUserListUpdate} // Truyền prop kích hoạt update
              />
            </Grid>
            <div className="main-topbar-buffer" />
            <Grid item sm={2}>
              <Paper className="main-grid-item">
                {loggedInUser ? <UserList updateUserListTrigger={updateUserListTrigger} /> : null}
              </Paper>
            </Grid>
            <Grid item sm={9}>
              {/* <Paper className="main-grid-item"> */}
                <Routes>
                  {loggedInUser ? (
                    <>
                      <Route path="/users/:userId" element={<UserDetail />} />
                      <Route path="/photos/:userId" element={<UserPhotos advancedFeatures={advancedFeatures} triggerUserListUpdate={triggerUserListUpdate} />} />
                      <Route path="/photos/:userId/:photoId" element={<UserPhotos advancedFeatures={advancedFeatures} triggerUserListUpdate={triggerUserListUpdate} />} />
                      <Route path="/comments/:userId" element={<UserComments />} />
                      {<Route path="/users" element={<UserList />} />}
                      <Route path="/" element={<UserDetail />} />
                    </>
                  ) : (
                    <>
                      <Route path="/login-register" element={<LoginRegister setLoggedInUser={setLoggedInUser} />} />
                      <Route path="*" element={<Navigate to="/login-register" replace />} />
                    </>
                  )}
                </Routes>
              {/* </Paper> */}
            </Grid>
          </Grid>
        </div>
      </Router>
  );
}

export default App;
