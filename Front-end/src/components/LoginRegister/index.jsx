import React, { useState } from "react";
import { Typography, Paper, TextField, Button, Box } from "@mui/material";
import fetchModel from "../../lib/fetchModelData";
import { useNavigate } from "react-router-dom";

function LoginRegister({ setLoggedInUser }) {
  const [loginName, setLoginName] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Registration state
  const [regLoginName, setRegLoginName] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPassword2, setRegPassword2] = useState("");
  const [regFirstName, setRegFirstName] = useState("");
  const [regLastName, setRegLastName] = useState("");
  const [regLocation, setRegLocation] = useState("");
  const [regDescription, setRegDescription] = useState("");
  const [regOccupation, setRegOccupation] = useState("");
  const [regErrorMsg, setRegErrorMsg] = useState("");
  const [regSuccessMsg, setRegSuccessMsg] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginName || !password) return;

    try {
      const res = await fetchModel("/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ login_name: loginName, password: password }),
      });
      
      setLoggedInUser(res);
      navigate(`/users/${res._id}`);
    } catch (err) {
      console.error(err);
      setErrorMsg("User not found or invalid password.");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (regPassword !== regPassword2) {
      setRegErrorMsg("Passwords do not match!");
      setRegSuccessMsg("");
      return;
    }

    try {
      await fetchModel("/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            login_name: regLoginName,
            password: regPassword,
            first_name: regFirstName,
            last_name: regLastName,
            location: regLocation,
            description: regDescription,
            occupation: regOccupation
        }),
      });

      setRegSuccessMsg("Registration successful! You can now log in.");
      setRegErrorMsg("");
      
      // Clear form
      setRegLoginName(""); setRegPassword(""); setRegPassword2("");
      setRegFirstName(""); setRegLastName(""); setRegLocation("");
      setRegDescription(""); setRegOccupation("");
    } catch (err) {
      setRegErrorMsg("Registration failed. Login name may be taken or missing required fields.");
      setRegSuccessMsg("");
    }
  };

  return (
    <Box display="flex" justifyContent="center" gap={4} mt={10} flexWrap="wrap">
      {/* LOGIN SECTION */}
      <Paper elevation={3} sx={{ padding: 4, width: 400 }}>
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
            />
            <TextField
              label="Password"
              type="password"
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {errorMsg && <Typography color="error">{errorMsg}</Typography>}
            <Button type="submit" variant="contained" color="primary">
              Login
            </Button>
          </Box>
        </form>
      </Paper>

      {/* REGISTRATION SECTION */}
      <Paper elevation={3} sx={{ padding: 4, width: 400 }}>
        <Typography variant="h5" gutterBottom>
          Register New User
        </Typography>
        <form onSubmit={handleRegister}>
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField label="Login Name" required value={regLoginName} onChange={(e) => setRegLoginName(e.target.value)} />
            <TextField label="First Name" required value={regFirstName} onChange={(e) => setRegFirstName(e.target.value)} />
            <TextField label="Last Name" required value={regLastName} onChange={(e) => setRegLastName(e.target.value)} />
            <TextField label="Password" type="password" required value={regPassword} onChange={(e) => setRegPassword(e.target.value)} />
            <TextField label="Verify Password" type="password" required value={regPassword2} onChange={(e) => setRegPassword2(e.target.value)} />
            <TextField label="Location" value={regLocation} onChange={(e) => setRegLocation(e.target.value)} />
            <TextField label="Description" value={regDescription} onChange={(e) => setRegDescription(e.target.value)} />
            <TextField label="Occupation" value={regOccupation} onChange={(e) => setRegOccupation(e.target.value)} />
            
            {regErrorMsg && <Typography color = "red">{regErrorMsg}</Typography>}
            {regSuccessMsg && <Typography color = "green">{regSuccessMsg}</Typography>}
            
            <Button type="submit" variant="contained" color="secondary">
              Register Me
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}

export default LoginRegister;
