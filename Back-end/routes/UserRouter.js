const express = require("express");
const User = require("../db/userModel");
const router = express.Router();



// returns list of users { _id, first_name, last_name }.
router.get("/list", async (req, res) =>{
    const users = await User.find({}, '_id first_name last_name');
    // console.log("Received request");
    if(!users)
    {
        res.status(404).json({"message": "No users found"});
    }
    else
    {
        res.status(200).json(users);
    }
});

// returns the detail of user {_id, first_name, last_name,
// location, description, occupation }
router.get("/:id", async (req, res) => {
    const userId = req.params.id;
    console.log(userId);
    try {
        const user = await User.findById(userId, '_id first_name last_name location description occupation');
        if(!user)
        {
            res.status(404).json({"message": "No user found"});
        }
        else
        {
            res.status(200).json(user);
        }
    } catch (err) {
        res.status(400).json({"message": "Invalid user ID"});
    }
});


module.exports = router;