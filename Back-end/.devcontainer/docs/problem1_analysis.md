# Problem 1: Simple Login - Requirements Analysis & Implementation Plan

Based on your `Final Project.md`, here is a breakdown of the requirements for **Problem 1: Simple Login** and the most understandable, step-by-step solution to apply these changes to your React/Node.js project.

---

## 1. Back-end Changes

The most understandable solution for session management in an Express server is using `express-session`. It handles cookies and session storage automatically.

### A. Update the User Model (`Back-end/db/userModel.js`)
Extend the Mongoose schema for the `User` to include a `login_name`.
```javascript
const userSchema = new mongoose.Schema({
  first_name: { type: String },
  last_name: { type: String },
  location: { type: String },
  description: { type: String },
  occupation: { type: String },
  login_name: { type: String, required: true, unique: true } // ADD THIS LINE
});
```

### B. Install & Configure `express-session`
In your terminal, navigate to your `Back-end` directory and run:
`npm install express-session`

Then, in your `Back-end/index.js`, import and configure it **before** your API routes:
```javascript
const session = require("express-session");

app.use(session({
    secret: 'secretKey',
    resave: false,
    saveUninitialized: false,
}));
```

### C. Create Admin Routes (`Back-end/routes/adminRouter.js`)
Create a new router for authentication with two POST endpoints:
1. **`POST /admin/login`**: 
   - Extract `login_name` from `req.body`.
   - Query the database to ensure the user exists.
   - If they don't, return `res.status(400).send("Invalid login name")`.
   - If they do, save `req.session.userId = user._id` and `req.session.first_name = user.first_name`. Return the user details (e.g., `_id`, `first_name`).
2. **`POST /admin/logout`**:
   - Check if `req.session.userId` exists. If not, return `400`.
   - If it does, call `req.session.destroy()` and return `200 OK`.

*(Don't forget to register this router in `index.js`: `app.use('/admin', adminRouter)`)*

### D. Add Authorization Middleware (`Back-end/index.js`)
To protect your existing endpoints (`/user/...` and `/photos/...`), add a middleware function in `index.js`. 
**Crucial**: Place this middleware *after* your `/admin` routes but *before* your `/user` and `/photos` routes.

```javascript
app.use(function (req, res, next) {
    if (req.session.userId) {
        next(); // User is logged in, allow them to proceed
    } else {
        res.status(401).send("Unauthorized"); // Block access
    }
});
```

---

## 2. Front-end Changes

The simplest approach for the frontend is to hoist a `loggedInUser` state to your top-level `<App />` component so it can dictate what is rendered across the entire application.

### A. Manage State in `Front-end/src/App.js`
1. Add state: `const [loggedInUser, setLoggedInUser] = useState(null);`
2. Update the layout:
   - Pass `loggedInUser` and `setLoggedInUser` down to your `<TopBar />`.
   - Conditionally render the `<UserList />`. If `!loggedInUser`, you can just render an empty `<div>` instead of the user list.
   - Conditionally protect your `<Routes>`. If the user is **not** logged in, the ONLY route available should be the new `LoginRegister` component.

```jsx
// Example logic in App.js Routes:
<Routes>
  {loggedInUser ? (
      <>
        <Route path="/users/:userId" element={<UserDetail />} />
        <Route path="/photos/:userId" element={<UserPhotos />} />
        <Route path="/comments/:userId" element={<UserComments />} />
        <Route path="/users" element={<UserList />} />
        <Route path="/" element={<UserList />} />
      </>
  ) : (
      // If NOT logged in, catch all routes and show LoginRegister
      <Route path="*" element={<LoginRegister setLoggedInUser={setLoggedInUser} />} />
  )}
</Routes>
```

### B. Create `LoginRegister` Component (`Front-end/src/components/LoginRegister/index.jsx`)
Create a simple form view:
1. Contains a single text input for `login_name` and a "Login" button.
2. `onSubmit` makes an API call to `POST /admin/login`. *(Ensure you use `fetch` with `credentials: 'include'` so the session cookie is saved in the browser)*.
3. If the backend returns `400`, display an error message on the screen (e.g., "User not found").
4. If successful, call `setLoggedInUser(user)` which will automatically switch the `App.js` view. Then, use `navigate('/users/' + user._id)` to fulfill the requirement that logs them into their detail view.

### C. Update `TopBar` Component (`Front-end/src/components/TopBar/index.jsx`)
Modify it to accept the `loggedInUser` and `setLoggedInUser` props.
- **If `!loggedInUser`**: Display "Please Login".
- **If `loggedInUser`**: 
  - Display "Hi, {loggedInUser.first_name}".
  - Render a "Logout" button. 
  - When the "Logout" button is clicked, make an API call to `POST /admin/logout`. On success, call `setLoggedInUser(null)`.

### D. Update `UserList` Component (`Front-end/src/components/UserList/index.jsx`)
The prompt requires that the user list is **not populated** if the user isn't logged in. 
Because of our `App.js` change (conditionally rendering it), it might be completely hidden. If you want the side panel background to still exist but just be empty, simply wrap your `fetchModel` call inside `useEffect` with an `if (loggedInUser)` check, or just don't mount the `List` inside the component if the user is null. And ensure that `fetchModel` in your `lib` gracefully handles `401 Unauthorized` responses.
