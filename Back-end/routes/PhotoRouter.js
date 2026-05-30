const express = require("express");
const Photo = require("../db/photoModel");
const User = require("../db/userModel");
const router = express.Router();


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

module.exports = router;
