# Problem 3: Photo Uploading - Requirements Analysis & Implementation Plan

Based on your `Final Project.md`, here is a breakdown of the requirements for **Problem 3: Photo Uploading** and the most understandable, step-by-step solution to apply these changes to your project.

For each part of the solution, I have included an explanation of its function and exactly how it works to help you fully understand the mechanics.

---

## 1. Back-end Changes

### A. Install Multer for File Uploads
Express doesn't handle file uploads natively out of the box. The standard, most understandable library for this is `multer`.
In your terminal, navigate to your `Back-end` directory and run:
`npm install multer`

### B. Create the Photo Upload Endpoint (`Back-end/routes/PhotoRouter.js`)

**The Code Change:**
You need to import `multer`, configure it to save to your React app's images folder, and then create a new `POST` route at `/new` (since `PhotoRouter` is already mounted at `/photos` in `index.js`, this becomes `/photos/new`).

```javascript
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

// POST /photos/new
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
});
```

**Function (What it does):**
This code receives a file from the frontend, saves it securely to the disk under a unique name, and then creates a database record linking that file to the currently logged-in user.

**How it works:**
1. **Multer Configuration**: `diskStorage` tells `multer` exactly *where* to save the file (`destination`) and *what* to name it (`filename`). Using `Date.now()` ensures the filename is mathematically unique so two users uploading "cat.jpg" don't overwrite each other.
2. **Middleware**: `upload.single('photo')` intercepts the incoming request, parses the multipart-form data, saves the file to disk, and attaches the file's metadata to `req.file`.
3. **Database Saving**: It pulls the newly generated `req.file.filename` and matches it with the secure `req.session.userId` to create the MongoDB document.

---

## 2. Front-end Changes

### Update the Toolbar (`Front-end/src/components/TopBar/index.jsx`)

**The Code Change:**
When a user is logged in, the toolbar needs an "Add Photo" button. The easiest way to handle file selection without building a massive new UI page is to use a hidden HTML `<input type="file" />` that is triggered when the Material UI Button is clicked.

```jsx
import React, { useEffect, useState, useRef } from "react"; // Add useRef

// Inside your TopBar component:
const uploadInputRef = useRef(null);

const handleAddPhotoClick = (e) => {
    e.preventDefault();
    uploadInputRef.current.click(); // Programmatically click the hidden file input
};

const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // We must use FormData to send files over HTTP
    const formData = new FormData();
    formData.append('photo', file); // 'photo' matches upload.single('photo') in backend

    try {
        const res = await fetch("http://localhost:8081/photos/new", {
            method: "POST",
            body: formData,
            credentials: "include" // VERY IMPORTANT: Sends the session cookie
        });

        if (res.ok) {
            // Optional: Show an alert or navigate the user to their own photos page
            alert("Photo uploaded successfully!");
            // navigate(`/photos/${loggedInUser._id}`);
        } else {
            alert("Failed to upload photo");
        }
    } catch (err) {
        console.error("Upload error", err);
    }
};

// Inside your returned JSX Toolbar (next to the Logout button):
{loggedInUser && (
    <>
        <Button color="inherit" onClick={handleAddPhotoClick} style={{ marginLeft: 16 }}>
            Add Photo
        </Button>
        {/* Hidden file input */}
        <input 
            type="file" 
            accept="image/*" 
            ref={uploadInputRef} 
            style={{ display: "none" }} 
            onChange={handleFileChange} 
        />
        <Button color="inherit" onClick={handleLogout} style={{ marginLeft: 16 }}>
            Logout
        </Button>
    </>
)}
```

**Function (What it does):**
Provides a seamless 1-click button in the TopBar that opens the operating system's file browser. Once a file is picked, it automatically packages it and sends it to the server.

**How it works:**
1. **The Hidden Input**: `<input type="file">` is ugly by default. By giving it `display: none` and a `ref`, we can hide it completely.
2. **The Trigger**: When the sleek Material UI "Add Photo" button is clicked, React uses the `ref` to artificially "click" the hidden file input, opening the file browser.
3. **FormData API**: You cannot send a raw file using standard JSON formatting. The `FormData` object perfectly mimics an HTML form submission, which `multer` knows how to read.
4. **Fetch**: We bypass the custom `fetchModel` here because `fetchModel` typically hardcodes `Content-Type: application/json`. Sending `FormData` requires the browser to auto-calculate the `Content-Type` with a specialized "boundary". We just use standard `fetch` with `credentials: "include"` so the backend knows *who* is uploading the photo.
