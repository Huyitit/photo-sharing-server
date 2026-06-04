# Problem 5: Advanced Features (Stepper) - Requirements Analysis & Implementation Plan

Based on your `Final Project.md`, here is a breakdown of the requirements for **Problem 5: Advanced Features**. This extra-credit problem involves adding a global toggle switch that transforms the user's photo gallery into a single-photo stepper view with bookmarkable URLs.

To make this implementation straightforward, I have divided the solution into four logical parts.

---

## Part 1: Global State for "Advanced Features" (`App.js`)

**The Code Change:**
Since both the `TopBar` (which displays the checkbox) and `UserPhotos` (which displays the photos) need to know if Advanced Features are enabled, we must "lift" this state up to their closest common ancestor: `App.js`.

```jsx
// Inside App.js
const [advancedFeatures, setAdvancedFeatures] = useState(false); // Disabled by default on startup

// Pass it to TopBar
<TopBar 
    loggedInUser={loggedInUser} 
    setLoggedInUser={setLoggedInUser} 
    advancedFeatures={advancedFeatures}
    setAdvancedFeatures={setAdvancedFeatures}
/>

// And pass the value to UserPhotos via the Route (Note: We also add a new route for deep linking)
<Route path="/photos/:userId" element={<UserPhotos advancedFeatures={advancedFeatures} />} />
<Route path="/photos/:userId/:photoId" element={<UserPhotos advancedFeatures={advancedFeatures} />} />
```

**Function:** 
Holds the global source of truth for whether the Advanced Features checkbox is ticked.
**How it works:** 
By keeping the state in `App.js`, any change made in the TopBar will instantly re-render the `UserPhotos` component below, seamlessly switching between the standard view and the stepper view. Notice that we also added a second route (`/:userId/:photoId`) to support deep linking to a specific photo, which satisfies the final bullet point.

---

## Part 2: The Checkbox UI (`TopBar/index.jsx`)

**The Code Change:**
We need to add a Material UI Checkbox to the top navigation bar.

```jsx
// Remember to import Checkbox and FormControlLabel from @mui/material
// Add props advancedFeatures, setAdvancedFeatures to the TopBar function arguments

<Typography variant="h5" color="inherit" marginLeft="auto">
    {displayText}
</Typography>

{/* New Checkbox Component */}
<FormControlLabel
    control={
        <Checkbox 
            checked={advancedFeatures} 
            onChange={(e) => setAdvancedFeatures(e.target.checked)} 
            style={{ color: 'white' }} 
        />
    }
    label="Enable Advanced Features"
    style={{ marginLeft: 16 }}
/>
```

**Function:** 
Provides the user interface to enable or disable the feature.
**How it works:** 
When the user clicks the checkbox, it triggers `setAdvancedFeatures` from `App.js`. Because the state lives in `App.js`, React automatically tells `UserPhotos` to re-render using the new viewing mode.

---

## Part 3: Deep Linking & URL Syncing (`UserPhotos/index.jsx`)

**The Code Change:**
When Advanced Features is enabled, the app must allow users to bookmark the current photo. This means the URL must dictate which photo is shown, not just a local React state.

```jsx
// We extract BOTH userId and the optional photoId from the URL
const { userId, photoId } = useParams();
const navigate = useNavigate();

// ... existing fetch logic ...

// Calculate which photo to show
let currentPhotoIndex = 0;
if (advancedFeatures && userPhotos.length > 0) {
    if (photoId) {
        // Find the index of the photo ID in the URL
        const index = userPhotos.findIndex(p => p._id === photoId);
        if (index !== -1) currentPhotoIndex = index;
    } else {
        // If Advanced Features is ON but there's no photoId in the URL, automatically redirect to the first photo
        navigate(`/photos/${userId}/${userPhotos[0]._id}`, { replace: true });
    }
}
```

**Function:** 
Syncs the browser's URL bar with the currently viewed photo.
**How it works:** 
Instead of tracking the current photo with a simple `useState`, we derive it directly from the `useParams()`. This guarantees that if a user bookmarks `/photos/123/abc` and sends it to a friend, the friend's app will immediately extract `abc`, find it in the array, and show the exact same photo. Furthermore, since navigation changes the URL, the browser's native Back and Forward buttons will work flawlessly.

---

## Part 4: The Stepper Logic & Rendering (`UserPhotos/index.jsx`)

**The Code Change:**
Finally, we conditionally render either the old list view or the new single-photo stepper view based on the `advancedFeatures` prop.

```jsx
// 1. Stepper Navigation Functions
const handleNext = () => {
    const nextPhotoId = userPhotos[currentPhotoIndex + 1]._id;
    navigate(`/photos/${userId}/${nextPhotoId}`); // Changes the URL
};

const handlePrev = () => {
    const prevPhotoId = userPhotos[currentPhotoIndex - 1]._id;
    navigate(`/photos/${userId}/${prevPhotoId}`); // Changes the URL
};

// 2. Conditional Rendering
if (advancedFeatures) {
    const photo = userPhotos[currentPhotoIndex];
    return (
        <div>
            {/* The Stepper Controls */}
            <Box display="flex" justifyContent="space-between" mb={2}>
                <Button 
                    variant="contained" 
                    disabled={currentPhotoIndex === 0} // Disable if first photo
                    onClick={handlePrev}
                >
                    Prev
                </Button>
                <Typography>Photo {currentPhotoIndex + 1} of {userPhotos.length}</Typography>
                <Button 
                    variant="contained" 
                    disabled={currentPhotoIndex === userPhotos.length - 1} // Disable if last photo
                    onClick={handleNext}
                >
                    Next
                </Button>
            </Box>

            {/* Render the single photo here just like you normally do */}
            <Paper>
                <img src={`http://localhost:8081/images/${photo.file_name}`} alt="user" />
                {/* ... render comments for this single photo ... */}
            </Paper>
        </div>
    );
}

// If advanced features is false, just render the standard map() loop of all photos
return (
    <div>
        {userPhotos.map((photo) => ( ... ))}
    </div>
);
```

**Function:** 
Replaces the scrolling list of photos with a single photo and functional Next/Prev buttons.
**How it works:** 
React intercepts the render cycle. If `advancedFeatures` is true, it skips the `.map()` loop entirely. Instead, it plucks just one photo out of the array using the `currentPhotoIndex` we calculated in Part 3. The Prev/Next buttons are strictly disabled if the user hits the boundary of the array. Clicking an active button triggers a React Router `navigate()`, which changes the URL, triggering Part 3 to recalculate the index, re-rendering the screen seamlessly.
