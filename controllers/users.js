const User = require("../models/user.js");

module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup.ejs");
};

module.exports.signup = async (req, res, next) => {
    try {
        let { username, email, password, adminCode } = req.body;
        let isAdmin = false;
        const validAdminCode = process.env.ADMIN_SECRET_CODE || "wanderlustAdmin2024";
        const adminUsername = process.env.ADMIN_USERNAME || "admin";

        if (adminCode && adminCode.trim() !== "") {
            if (adminCode.trim() === validAdminCode) {
                isAdmin = true;
            } else {
                req.flash("error", "Invalid Admin Secret Key!");
                return res.redirect("/signup");
            }
        }

        if (username && username.trim().toLowerCase() === adminUsername.toLowerCase()) {
            isAdmin = true;
        }

        const newUser = new User({ email, username, isAdmin });
        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser);
        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }
            if (isAdmin) {
                req.flash("success", "Welcome Admin! You have universal edit & delete permissions.");
            } else {
                req.flash("success", "Welcome to Wanderlust!");
            }
            res.redirect("/listings");
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
};

module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs");
};

module.exports.login = async (req, res) => {
    const adminUsername = process.env.ADMIN_USERNAME || "admin";
    if (req.user && (req.user.isAdmin || req.user.username === adminUsername)) {
        req.flash("success", "Welcome back, Admin! Universal access active.");
    } else {
        req.flash("success", "Welcome back to Wanderlust!");
    }
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "You are logged out!");
        res.redirect("/listings");
    });
};
