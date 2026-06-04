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
              <TopBar loggedInUser={loggedInUser} setLoggedInUser={setLoggedInUser} />
            </Grid>
            <div className="main-topbar-buffer" />
            <Grid item sm={3}>
              <Paper className="main-grid-item">
                {loggedInUser ? <UserList /> : null}
              </Paper>
            </Grid>
            <Grid item sm={9}>
              {/* <Paper className="main-grid-item"> */}
                <Routes>
                  {loggedInUser ? (
                    <>
                      <Route path="/users/:userId" element={<UserDetail />} />
                      <Route path="/photos/:userId" element={<UserPhotos />} />
                      <Route path="/comments/:userId" element={<UserComments />} />
                      <Route path="/users" element={<UserList />} />
                      <Route path="/" element={<UserList />} />
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
