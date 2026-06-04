# Problem 2: New Comments - Requirements Analysis & Implementation Plan

Based on your `Final Project.md`, here is a breakdown of the requirements for **Problem 2: New Comments** and the most understandable, step-by-step solution to apply these changes to your project. 

For each part of the solution, I have included an explanation of its function and exactly how it works to help you fully understand the mechanics.

---

## 1. Back-end Changes

### Create the Add Comment Endpoint (`Back-end/routes/PhotoRouter.js` or `index.js`)

**The Code Change:**
You need to create a new `POST` route at `/commentsOfPhoto/:photo_id`. 
```javascript
// POST /commentsOfPhoto/:photo_id
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
```

**Function (What it does):**
This API endpoint receives a new comment from the frontend, attaches it to the correct user and photo, and saves it permanently to the MongoDB database.

**How it works:**
1. **URL Parameter**: It grabs the `photo_id` straight from the URL (`req.params.photo_id`).
2. **Validation**: It checks if `req.body.comment` is missing or empty. If so, it immediately rejects the request with a `400 Bad Request` status.
3. **Security/Session**: Notice how the client *doesn't* send the `user_id`. Instead, we pull `req.session.userId`. This is highly secure because it guarantees a user can only post comments as themselves. (This relies on the `express-session` setup from Problem 1).
4. **Database Update**: It finds the photo document via Mongoose, pushes the new comment object into the `comments` array, and calls `.save()`.

---

## 2. Front-end Changes

### Update the Photo Detail View (`Front-end/src/components/UserPhotos/index.jsx`)

**The Code Change:**
You need to add a text input field and a submit button underneath each photo.

1. **Add State for Comment Inputs**:
   Since a single page displays *multiple* photos, you need a way to track the typed text for *each* photo independently. The most understandable way is using an object dictionary in your state:
   ```jsx
   // This holds text inputs mapped by photo_id: { "photoId1": "nice pic!", "photoId2": "cool" }
   const [newComments, setNewComments] = useState({});
   ```

2. **Create the Input Handler**:
   ```jsx
   const handleCommentChange = (photoId, text) => {
       setNewComments({ ...newComments, [photoId]: text });
   };
   ```

3. **Create the Submit Handler**:
   ```jsx
   const handleAddComment = async (photoId) => {
       const text = newComments[photoId];
       if (!text) return; // don't submit if empty

       try {
           // Send the POST request to our new backend endpoint
           await fetchModel(`/commentsOfPhoto/${photoId}`, {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ comment: text })
           });

           // Clear the text input for this photo
           setNewComments({ ...newComments, [photoId]: "" });

           // Refresh the photos list so the new comment appears immediately!
           const refreshedPhotos = await fetchModel(`/photosOfUser/${userId}`);
           setUserPhotos(refreshedPhotos);
       } catch (err) {
           console.error("Failed to add comment", err);
       }
   };
   ```

4. **Update the Rendered JSX**:
   Inside your `.map()` loop that renders each photo, add the interface right below the comments:
   ```jsx
   {/* Existing comment rendering here... */}
   
   <div style={{ marginTop: '10px' }}>
       <TextField 
           label="Add a comment..." 
           variant="outlined" 
           size="small"
           value={newComments[photo._id] || ""}
           onChange={(e) => handleCommentChange(photo._id, e.target.value)}
       />
       <Button 
           variant="contained" 
           onClick={() => handleAddComment(photo._id)}
           style={{ marginLeft: '10px' }}
       >
           Post
       </Button>
   </div>
   ```

**Function (What it does):**
Provides the user interface for a logged-in user to type a comment directly underneath any photo and submit it to the server.

**How it works:**
1. **Dynamic State Mapping**: By storing state as `newComments[photo._id]`, typing in the input box of Photo A does not overwrite the text you've started typing in the input box of Photo B.
2. **Submission (`handleAddComment`)**: When the user clicks "Post", it takes the text for that specific `photoId` and uses `fetchModel` to issue a `POST` request. 
3. **Instant UI Refresh**: The requirements state: *"The display of the photo and its comments should be updated immediately"*. By calling `fetchModel` to fetch the user's photos again immediately after a successful POST, React will automatically overwrite the `userPhotos` state, triggering a re-render that instantly displays the brand new comment!
