import React, { useState } from "react";
import { Typography, Paper, TextField, Button, Box } from "@mui/material";
import fetchModel from "../../lib/fetchModelData";
import { useNavigate } from "react-router-dom";

function LoginRegister({ setLoggedInUser }) {
  const [loginName, setLoginName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginName) return;

    try {
      // Because fetchModel uses response.json() natively, we can use it.
      // But fetchModel expects GET. Wait, we modified fetchModel to accept options.
      const res = await fetchModel("/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ login_name: loginName }),
      });
      
      setLoggedInUser(res);
      navigate(`/users/${res._id}`);
    } catch (err) {
      console.error(err);
      setErrorMsg("User not found or invalid login name.");
    }
  };

  return (
    <Paper elevation={3} sx={{ padding: 4, maxWidth: 400, margin: "auto", mt: 10 }}>
      <Typography variant="h5" gutterBottom>
        Please Login
      </Typography>
      <form onSubmit={handleLogin}>
        <Box display="flex" flexDirection="column" gap={2}>
          <TextField
            label="Login Name"
            variant="outlined"
            value={loginName}
            onChange={(e) => setLoginName(e.target.value)}
            required
            fullWidth
          />
          {errorMsg && <Typography color="error">{errorMsg}</Typography>}
          <Button type="submit" variant="contained" color="primary">
            Login
          </Button>
        </Box>
      </form>
    </Paper>
  );
}

export default LoginRegister;
