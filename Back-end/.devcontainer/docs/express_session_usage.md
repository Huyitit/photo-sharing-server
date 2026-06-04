# How `express-session` is Used in the Photo Sharing App

The `express-session` library is the backbone of the authentication system in this project. Because HTTP is inherently a "stateless" protocol (meaning the server forgets who you are the millisecond after it sends you a webpage), `express-session` allows the Express backend to securely remember users across multiple requests using cookies.

Here is a detailed, chronological breakdown of exactly how it is implemented, step-by-step, using code directly from your project.

---

## 1. Initialization & Configuration

Before sessions can be used, the middleware must be configured in your main server entry point (`Back-end/index.js`).

**Code Example (`Back-end/index.js`):**
```javascript
const session = require("express-session");

app.use(session({
    secret: 'secretKey',
    resave: false,
    saveUninitialized: false,
}));
```

**Explanation:**
- `app.use(session(...))` attaches the session engine to Express. 
- The `secret` is a cryptographic key used to digitally sign the session ID cookie. If a hacker tries to tamper with their cookie, the server will notice the signature doesn't match and reject it.
- `resave: false` and `saveUninitialized: false` are modern optimizations that prevent the server from wasting memory by saving empty or unmodified sessions.

---

## 2. Creating a Session (Logging In)

When a user successfully logs in, the server proves their identity by checking MongoDB. If the credentials are valid, the server "memorizes" the user's ID by attaching it to the `req.session` object.

**Code Example (`Back-end/routes/adminRouter.js`):**
```javascript
router.post("/login", async (req, res) => {
    // ... validate login_name and password ...

    const user = await User.findOne({ login_name: login_name, password: password });
    if (!user) {
        return res.status(400).send("Invalid login name or password");
    }

    // Store user in session!
    req.session.userId = user._id;
    req.session.first_name = user.first_name;

    res.status(200).json(user);
});
```

**Explanation:**
The moment `req.session.userId = user._id` executes, `express-session` springs into action. Behind the scenes, it generates a long, random Session ID string (e.g., `s%3A12345abc...`), saves `userId` in the server's memory under that ID, and automatically sends a `Set-Cookie` HTTP header to the user's browser containing that random Session ID.

---

## 3. Protecting Routes (Auth Middleware)

Once the user is logged in, their browser will automatically send that cookie back to the server on every single request. The server uses this to block unauthorized users from seeing data.

**Code Example (`Back-end/index.js`):**
```javascript
// Auth middleware
app.use((req, res, next) => {
    // Exempt registration (POST /user) from authentication
    if (req.path === '/user' && req.method === 'POST') {
        return next();
    }

    // Check if the session remembers the user
    if (req.session.userId) {
        next(); // User is valid, allow them to proceed to the route
    } else {
        res.status(401).send("Unauthorized"); // User is a stranger, block them
    }
});

// Protected routes placed BELOW the middleware
app.use("/user", UserRouter);
app.use("/photos", PhotoRouter);
```

**Explanation:**
When a browser requests `/user/list`, `express-session` reads the incoming cookie, looks up the Session ID in its memory, and attaches the saved data back onto `req.session`.
Our middleware simply checks: *Does `req.session.userId` exist?* If yes, it calls `next()` to let the user see the data. If no, it halts the request and returns a `401 Unauthorized` error.

---

## 4. Persisting State on the Frontend

When a user refreshes the React app, React loses all its local `useState` data (meaning `loggedInUser` becomes `null`). To fix this, React asks the backend if the browser still holds a valid session cookie.

**Code Example (`Back-end/routes/adminRouter.js`):**
```javascript
// GET /admin/check
router.get("/check", async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).send("Not logged in");
    }
    // If session exists, fetch user and return it
    const user = await User.findById(req.session.userId);
    res.status(200).json(user);
});
```

**Explanation:**
In `App.js` on the frontend, an effect runs on boot to hit `/admin/check`. If the session cookie is still valid, the backend retrieves the user from MongoDB using the remembered `req.session.userId` and sends it back to React, automatically logging the user back in without asking for their password again.

---

## 5. Destroying a Session (Logging Out)

To log out, the server must permanently delete the session from its memory.

**Code Example (`Back-end/routes/adminRouter.js`):**
```javascript
// POST /admin/logout
router.post("/logout", (req, res) => {
    if (!req.session.userId) {
        return res.status(400).send("Not logged in");
    }

    // Obliterate the session
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send("Could not log out");
        }
        res.status(200).send("Logged out");
    });
});
```

**Explanation:**
`req.session.destroy()` deletes the session data on the server. Even if the browser tries to use the old cookie again, the server will no longer recognize it, turning the user back into an unauthorized stranger.

---

## *Crucial Requirement: Cross-Origin Resource Sharing (CORS)*

For `express-session` to work when React (Port 3000) talks to Express (Port 8081), cookies must be explicitly allowed to cross domains.

**Code Example (`Back-end/index.js`):**
```javascript
app.use(cors({
    origin: true,
    credentials: true, // Tells Express to accept incoming cookies
}));
```

**Code Example (`Front-end/src/lib/fetchModelData.js`):**
```javascript
async function fetchModel(url, options = {}) {
  const defaultOptions = {
    credentials: "include", // Tells the browser to send the cookie
  };
  const finalOptions = { ...defaultOptions, ...options };
  const response = await fetch(url, finalOptions);
  // ...
}
```

**Explanation:**
Without `credentials: "include"` on the frontend and `credentials: true` on the backend, modern browser security protocols will silently strip the session cookie out of the HTTP requests, completely breaking the authentication system.
