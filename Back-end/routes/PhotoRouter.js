const express = require("express");
const Photo = require("../db/photoModel");
const User = require("../db/userModel");
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer to save files to your Front-end/src/images directory
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Adjust this path if your images are located elsewhere (like public/images)
        const dir = path.join(__dirname, '../../Front-end/src/images');
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        // Generate a unique filename using timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });


// returns list of photos of user {_id, user_id, comments, file_name, date_time}
// and the comments array contains {comment, date_time, _id, user}
// and a minimum user object { _id, first_name, last_name }.
router.get("/photosOfUser/:id", async (req, res)=>{
    const id = req.params.id;
    console.log(id);
    try {
        // 1. Get all photos of the user
        const photos = await Photo.find({ user_id: id }).lean(); // .lean() for plain JS objects

        if (photos.length === 0) {
            return res.status(404).json({ message: "No photos found" });
        }

        // 2. Collect all unique commenter user IDs
        const userIds = [];
        photos.forEach(photo => {
            photo.comments.forEach(comment => {
                if (comment.user_id) {
                    userIds.push(comment.user_id.toString());
                }
            });
        });
        const uniqueUserIds = [...new Set(userIds)];

        // 3. Fetch all those users in one query (only the fields we need)
        const users = await User.find(
            { _id: { $in: uniqueUserIds } },
            '_id first_name last_name'
        ).lean();


        // 4. Build a map: user_id -> minimal user object
        const userMap = {}; 
        users.forEach(user => {
            userMap[user._id.toString()] = {
                _id: user._id,
                first_name: user.first_name,
                last_name: user.last_name,
            };
        });

        // 5. Transform comments in each photo
        const transformedPhotos = photos.map(photo => {
            const newComments = photo.comments.map(comment => {
                const userObj = userMap[comment.user_id?.toString()] || null;
                return {
                    comment: comment.comment,
                    date_time: comment.date_time,
                    _id: comment._id,
                    user: userObj,               // minimal user object
                };
            });
            return {
                _id: photo._id,
                user_id: photo.user_id,
                file_name: photo.file_name,
                date_time: photo.date_time,
                comments: newComments,
            };
        });

        res.status(200).json(transformedPhotos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching photos" });
    }
});

// POST /commentsOfPhoto/:photo_id - Add a comment to a photo
router.post("/commentsOfPhoto/:photo_id", async (req, res) => {
    const photo_id = req.params.photo_id;
    const commentText = req.body.comment;

    // 1. Check for empty comment
    if (!commentText || commentText.trim().length === 0) {
        return res.status(400).send("Comment cannot be empty");
    }

    try {
        // 2. Find the photo
        const photo = await Photo.findById(photo_id);
        if (!photo) {
            return res.status(400).send("Photo not found");
        }

        // 3. Create and append the new comment
        const newComment = {
            comment: commentText,
            user_id: req.session.userId, // retrieved safely from the session!
            date_time: new Date()
        };
        
        photo.comments.push(newComment);
        await photo.save();

        res.status(200).send("Comment added successfully");
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});

// POST /new - Upload a photo for the current user
router.post("/new", upload.single('photo'), async (req, res) => {
    // 1. Check if a user is logged in (session validation)
    if (!req.session.userId) {
        return res.status(401).send("Unauthorized: Please login to upload photos");
    }

    // 2. Check if a file was actually uploaded
    if (!req.file) {
        return res.status(400).send("No file uploaded");
    }

    try {
        // 3. Create a new Photo document
        const newPhoto = new Photo({
            file_name: req.file.filename,
            user_id: req.session.userId, // Link photo to the logged in user
            date_time: new Date(),
            comments: [] // Initialize with an empty comments array
        });

        // 4. Save to the database
        await newPhoto.save();
        res.status(200).send("Photo uploaded successfully");
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error during upload");
    }
    console.log(res.status);
});

module.exports = router;
