const express = require("express");
const User = require("../db/userModel");
const router = express.Router();

// POST /admin/login
router.post("/login", async (req, res) => {
    const { login_name, password } = req.body;
    if (!login_name || !password) {
        return res.status(400).send("login_name and password are required");
    }

    try {
        const user = await User.findOne({ login_name: login_name, password: password });
        if (!user) {
            return res.status(400).send("Invalid login name or password");
        }

        // Store user in session
        req.session.userId = user._id;
        req.session.first_name = user.first_name;

        // Return user details
        res.status(200).json({
            _id: user._id,
            first_name: user.first_name,
            last_name: user.last_name,
            login_name: user.login_name
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});

// POST /admin/logout
router.post("/logout", (req, res) => {
    if (!req.session.userId) {
        return res.status(400).send("Not logged in");
    }

    req.session.destroy(err => {
        if (err) {
            return res.status(500).send("Could not log out");
        }
        res.status(200).send("Logged out");
    });
});

// GET /admin/check
router.get("/check", async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).send("Not logged in");
    }
    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(401).send("Not logged in");
        }
        res.status(200).json(user);
    } catch(err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});

module.exports = router;
