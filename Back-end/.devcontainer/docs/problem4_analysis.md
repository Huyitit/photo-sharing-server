# Problem 4: Registration and Passwords - Requirements Analysis & Implementation Plan

Based on your `Final Project.md`, here is a breakdown of the requirements for **Problem 4: Registration and Passwords**. 

To make this large requirement easier to handle, I have divided the most understandable, step-by-step solution into four logical parts. For each part, I explain its function and exactly how it works.

---

## Part 1: Database Schema Updates

### Update the User Model (`Back-end/db/userModel.js`)

**The Code Change:**
You need to add a `password` field to the User Mongoose schema.
```javascript
const userSchema = new mongoose.Schema({
    first_name: String,
    last_name: String,
    location: String,
    description: String,
    occupation: String,
    login_name: String,
    password: { type: String, required: true } // New field!
});
```

**Function:** 
Tells MongoDB that every User document must now have a password property.

**How it works:**
By adding `password: String` to the schema, you allow the database to save and retrieve the user's password. Adding `required: true` (optional but good practice) ensures no user is accidentally created without a password.

---

## Part 2: Backend Registration & Login Logic

### A. The Registration Endpoint (`Back-end/routes/UserRouter.js`)

**The Code Change:**
Create a new `POST /` route in `UserRouter.js` (which mounts as `POST /user` in `index.js`). Note that you'll have to add this *above* any catch-all routes like `/:id`.

```javascript
// POST /user - Register a new user
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
```

**Function:** 
Validates user input, ensures the login name isn't already taken, and safely creates a new user in the database.

**How it works:**
1. It destructures all the fields from the request body.
2. It explicitly checks that the non-empty fields mandated by the prompt exist. If not, it rejects with a `400 Bad Request`.
3. It queries the database using `.findOne()`. If an object returns, the username is taken.
4. Finally, it constructs a new Mongoose document and saves it, returning the newly created `_id` and `login_name` as required by the tests.

*(Note: Because this route is inside `/user`, you will need to temporarily exempt `POST /user` from your authentication middleware in `index.js` so that un-logged-in people can actually access the registration route!)*

### B. Update the Login Endpoint (`Back-end/routes/adminRouter.js`)

**The Code Change:**
Modify your existing `POST /admin/login` to also check the password.
```javascript
// Inside router.post("/login", ...)
const { login_name, password } = req.body; // Add password

// Check both fields
const user = await User.findOne({ login_name: login_name, password: password });
if (!user) {
    return res.status(400).send("Invalid login name or password"); // Generic error message
}
```

**Function:** 
Secures the login process.

**How it works:**
Instead of just matching the `login_name`, MongoDB now demands an exact match of *both* the `login_name` and `password` fields before it returns the user object.

---

## Part 3: Frontend Login Form Update

### Enhance `LoginRegister/index.jsx` Login Section

**The Code Change:**
You need to add a password input to the existing login form.
```jsx
const [password, setPassword] = useState("");

// Inside your handleLogin function:
const res = await fetchModel("/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ login_name: loginName, password: password }), // send password
});

// Inside your Login JSX:
<TextField
    label="Password"
    type="password" // Masks the characters
    variant="outlined"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    required
    fullWidth
/>
```

**Function:** 
Collects the password securely and sends it to `/admin/login`.

**How it works:**
`type="password"` tells the browser to mask the characters with dots/asterisks so onlookers can't read it. The password state is then bundled into the JSON payload alongside the `login_name`.

---

## Part 4: Frontend Registration Form Implementation

### Create the Registration Section in `LoginRegister/index.jsx`

**The Code Change:**
You need to build a second form side-by-side or below the login form. 
1. **Create State:** You will need states for `regLoginName`, `regPassword`, `regPassword2`, `regFirstName`, `regLastName`, `regLocation`, `regDescription`, `regOccupation`.
2. **Create the Registration Handler:**
```jsx
const handleRegister = async (e) => {
    e.preventDefault();
    if (regPassword !== regPassword2) {
        setRegErrorMsg("Passwords do not match!");
        return;
    }

    try {
        await fetchModel("/user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                login_name: regLoginName,
                password: regPassword,
                first_name: regFirstName,
                last_name: regLastName,
                location: regLocation,
                description: regDescription,
                occupation: regOccupation
            }),
        });

        setRegSuccessMsg("Registration successful! You can now log in.");
        setRegErrorMsg("");
        
        // Clear all form fields
        setRegLoginName(""); setRegPassword(""); setRegPassword2("");
        setRegFirstName(""); setRegLastName(""); setRegLocation("");
        setRegDescription(""); setRegOccupation("");
    } catch (err) {
        setRegErrorMsg(err.message || "Registration failed.");
        setRegSuccessMsg("");
    }
};
```
3. **Build the JSX Interface:** You will map out a series of `<TextField>` components wrapped in a `<form onSubmit={handleRegister}>` with a "Register Me" submit button. 

**Function:** 
Allows a new user to enter all their profile details, validates that their passwords match, and alerts them of explicit successes or failures.

**How it works:**
1. **Password Match Check:** Before even making a network request, the frontend validates `regPassword === regPassword2`. 
2. **Submission:** It POSTs to `/user`. If it succeeds, it clears all the local state variables, which immediately blanks out the form fields on the screen, and sets a green success message. If it fails (e.g. the backend returns 400 because the username is taken), it catches the error and displays the specific failure message.
