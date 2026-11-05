if (process.env.NODE_ENV != "production") {
    require("dotenv").config();
}

//Because of DNS(network) problem in JIO/Airtel
const dns = require("dns");
dns.setServers(["8.8.8.8"]);

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const { MongoStore } = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const { isLoggedIn } = require("./middleware.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const adminRouter = require("./routes/admin.js");

const LOCAL_DB_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl = process.env.ATLASDB_URL || LOCAL_DB_URL;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const initAdmin = async () => {
    try {
        const adminUsername = process.env.ADMIN_USERNAME || "admin";
        const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
        const adminEmail = process.env.ADMIN_EMAIL || "admin@wanderlust.com";

        const existingAdmin = await User.findOne({ username: adminUsername });
        if (!existingAdmin) {
            const adminUser = new User({
                username: adminUsername,
                email: adminEmail,
                isAdmin: true
            });
            await User.register(adminUser, adminPassword);
            console.log(`Universal Admin user created: "${adminUsername}"`);
        } else if (!existingAdmin.isAdmin) {
            existingAdmin.isAdmin = true;
            await existingAdmin.save();
            console.log(`Granted admin privileges to existing user: "${adminUsername}"`);
        }
    } catch (err) {
        console.error("Default admin setup error:", err.message);
    }
};

async function main() {
    try {
        await mongoose.connect(dbUrl, {
            serverSelectionTimeoutMS: 4000,
            tlsAllowInvalidCertificates: process.env.NODE_ENV !== "production"
        });
        console.log("Connected to MongoDB Atlas");
    } catch (atlasErr) {
        console.warn("⚠️ Atlas DB unreachable (likely IP whitelist or network). Falling back to local MongoDB...");
        try {
            await mongoose.connect(LOCAL_DB_URL);
            console.log("Connected to local MongoDB (mongodb://127.0.0.1:27017/wanderlust)");
        } catch (localErr) {
            console.error("Failed to connect to both Atlas and local MongoDB:", localErr.message);
            throw localErr;
        }
    }
    await initAdmin();
}

main().catch((err) => {
    console.error("DB Initialization error:", err.message);
});

const clientPromise = new Promise((resolve) => {
    if (mongoose.connection.readyState === 1) {
        return resolve(mongoose.connection.getClient());
    }
    mongoose.connection.once("open", () => {
        resolve(mongoose.connection.getClient());
    });
});

const store = MongoStore.create({
    clientPromise,
    crypto: {
        secret: process.env.SECRET || "wanderlustSecret2024",
    },
    touchAfter: 24 * 3600,
});

store.on("error", (err) => {
    console.log("ERROR in MONGO SESSION STORE", err.message || err);
});

const sessionOptions = {
    store,
    secret: process.env.SECRET || "wanderlustSecret2024",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24 * 3,
        maxAge: 1000 * 60 * 60 * 24 * 3,
        httpOnly: true
    },
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    if (req.user && (req.user.isAdmin || req.user.username === (process.env.ADMIN_USERNAME || "admin"))) {
        req.user.isAdmin = true;
    }
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

app.use("/", userRouter);
app.use("/admin", adminRouter);
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);

app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something Went Wrong!" } = err;
    res.status(statusCode).render("error.ejs", { message, statusCode });
});

app.listen(8080, () => {
    console.log("Server is listening to port 8080");
});
