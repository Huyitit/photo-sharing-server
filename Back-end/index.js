const express = require("express");
const app = express();
const cors = require("cors");
const dbConnect = require("./db/dbConnect");
const UserRouter = require("./routes/UserRouter");
const PhotoRouter = require("./routes/PhotoRouter");


const session = require("express-session");

dbConnect();

app.use(cors({
    origin: true,
    credentials: true,
}));
app.use(express.json());
app.use(session({
    secret: 'secretKey',
    resave: false,
    saveUninitialized: false,
}));

const adminRouter = require("./routes/adminRouter");
app.use("/admin", adminRouter);

// Auth middleware
app.use((req, res, next) => {
    // Exempt registration (POST /user) from authentication
    if (req.path === '/user' && req.method === 'POST') {
        return next();
    }
    if (req.session.userId) {
        next();
    } else {
        res.status(401).send("Unauthorized");
    }
});

app.use("/user", UserRouter);
app.use("/photos", PhotoRouter);

app.get("/", (request, response) => {
  response.send({ message: "Hello from photo-sharing app API!" });
});

app.listen(8081, () => {
  console.log("server listening on port 8081");
});
