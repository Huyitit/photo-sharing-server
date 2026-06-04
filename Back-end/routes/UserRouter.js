const express = require("express");
const User = require("../db/userModel");
const Photo = require("../db/photoModel");
const router = express.Router();

// POST / - Register a new user
router.post("/", async (req, res) => {
    const { login_name, password, first_name, last_name, location, description, occupation } = req.body;

    // 1. Validation check
    if (!login_name || !password || !first_name || !last_name) {
        return res.status(400).send("Login name, password, first name, and last name are required");
    }

    try {
        // 2. Uniqueness check
        const existingUser = await User.findOne({ login_name: login_name });
        if (existingUser) {
            return res.status(400).send("Login name already exists. Please choose another.");
        }

        // 3. Create user
        const newUser = new User({
            login_name, password, first_name, last_name, location, description, occupation
        });
        await newUser.save();

        res.status(200).json({ login_name: newUser.login_name, _id: newUser._id });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error during registration");
    }
});

// returns list of users { _id, first_name, last_name, photoCount, commentCount }.
router.get("/list", async (req, res) => {
    try {
        const users = await User.find({}, '_id first_name last_name').lean();
        if (!users || users.length === 0) {
            return res.status(404).json({"message": "No users found"});
        }

        const usersWithCounts = await Promise.all(users.map(async (user) => {
            const photoCount = await Photo.countDocuments({ user_id: user._id });
            
            const photosWithComments = await Photo.find({ "comments.user_id": user._id }).lean();
            let commentCount = 0;
            photosWithComments.forEach(photo => {
                photo.comments.forEach(comment => {
                    if (comment.user_id && comment.user_id.toString() === user._id.toString()) {
                        commentCount++;
                    }
                });
            });

            return {
                ...user,
                photoCount,
                commentCount
            };
        }));

        res.status(200).json(usersWithCounts);
    } catch (err) {
        console.error(err);
        res.status(500).json({"message": "Server error"});
    }
});

// returns all comments authored by a specific user
router.get("/comments/:id", async (req, res) => {
    const userId = req.params.id;
    try {
        const photos = await Photo.find({ "comments.user_id": userId }).lean();
        
        let userComments = [];
        photos.forEach(photo => {
            photo.comments.forEach(comment => {
                if (comment.user_id && comment.user_id.toString() === userId.toString()) {
                    userComments.push({
                        _id: comment._id,
                        comment: comment.comment,
                        date_time: comment.date_time,
                        photo: {
                            _id: photo._id,
                            file_name: photo.file_name,
                            user_id: photo.user_id
                        }
                    });
                }
            });
        });


        res.status(200).json(userComments);
    } catch (err) {
        console.error(err);
        res.status(400).json({"message": "Error fetching comments"});
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