# Requirements Analysis and Implementation Plan

Based on your requirement, here is a detailed report on what needs to be changed in your project code to implement the new features successfully.

## Requirement Overview
1. **Count Bubbles in User List**: The sidebar (`UserList`) needs two count bubbles next to each user.
   - 🟩 **Green Bubble**: Count of photos the user has uploaded.
   - 🟥 **Red Bubble**: Count of comments the user has authored.
2. **User Comments View**: Clicking the red comment bubble should navigate to a new view showing all comments made by that user.
   - Shows photo thumbnail and comment text.
   - Clicking either the thumbnail or the text navigates to the photo's detail view.

---

## 1. Back-end Changes

### A. Modify `Back-end/routes/UserRouter.js`
The `GET /user/list` endpoint currently only returns basic user info (`_id`, `first_name`, `last_name`). It needs to be updated to also compute and return `photoCount` and `commentCount` for each user.

**Suggested changes in `/list` route:**
- Retrieve all users as usual.
- Iterate through the users (using `Promise.all` with `map` or use a MongoDB Aggregation).
- For each user:
  - Query `Photo.countDocuments({ user_id: user._id })` to get the **photoCount**.
  - Query all photos containing comments from this user `Photo.find({ "comments.user_id": user._id })` and sum up the matching comments to get the **commentCount**.
- Return the updated user list including these two new properties.

### B. Add a new API endpoint for User Comments
You need a new route (e.g., `GET /user/comments/:id` in `UserRouter.js` or `PhotoRouter.js`) to fetch all comments authored by a specific user.

**What this endpoint should do:**
- Receive the `userId` from the URL parameter.
- Query the `Photo` model to find all photos where this user has commented: `Photo.find({ "comments.user_id": userId })`.
- Extract the specific comments made by the user and pair them with the photo's metadata (`photo_id`, `file_name` for the thumbnail, and the `photo_owner_id`).
- Return a flattened array of comment objects so the frontend can easily render them.

---

## 2. Front-end Changes

### A. Update `Front-end/src/components/UserList/index.jsx`
- Extract `photoCount` and `commentCount` from the user objects returned by the API.
- Add two new visual elements (like Material-UI `<Badge>`, `<Chip>`, or custom styled `<div>` bubbles) next to each user's name.
- Style the photo count bubble **green** and the comment count bubble **red**.
- Add an `onClick` event handler specifically to the red comment count bubble that navigates to the new comments view: `navigate('/comments/' + item._id)`.

### B. Create a new `UserComments` Component
Create a new folder and component at `Front-end/src/components/UserComments/index.jsx`.

**Features of this component:**
- Extract the `userId` from the route params (using `useParams()`).
- Fetch the user's comments from the new backend API you created (`/user/comments/:id`).
- Render a list/grid displaying:
  1. A small thumbnail of the photo (using `require('../../images/' + photo.file_name)` or equivalent).
  2. The text of the comment.
- Add an `onClick` handler to the thumbnail and the comment text. When clicked, it should navigate to the photo's detail view (`navigate('/photos/' + comment.photo_owner_id)`). You can optionally append an anchor hash (e.g., `#photo-id`) to scroll exactly to that photo if your photo view supports it.

### C. Update Routing in `Front-end/src/App.js`
Register the new view component so React Router can display it.

- Import the new component:
  ```javascript
  import UserComments from "./components/UserComments";
  ```
- Add a new `<Route>` inside the `<Routes>` element:
  ```javascript
  <Route path="/comments/:userId" element={<UserComments />} />
  ```

---

## Summary of Files to Modify/Create:
* `Back-end/routes/UserRouter.js` (Modify API)
* `Front-end/src/components/UserList/index.jsx` (UI & Navigation)
* `Front-end/src/components/UserList/styles.css` (Add styling for count bubbles)
* `Front-end/src/App.js` (Add new Route)
* `Front-end/src/components/UserComments/index.jsx` (New file)
* `Front-end/src/components/UserComments/styles.css` (New file)
