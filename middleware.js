const Listing = require("./models/listing");
const Review = require("./models/review");

const checkIsAdmin = (user) => {
    if (!user) return false;
    const adminUsername = process.env.ADMIN_USERNAME || "admin";
    return Boolean(user.isAdmin || user.username === adminUsername);
};

module.exports.checkIsAdmin = checkIsAdmin;

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be logged in!");
        return res.redirect("/login");
    }
    next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

module.exports.isAdmin = (req, res, next) => {
    if (!req.isAuthenticated() || !checkIsAdmin(req.user)) {
        req.flash("error", "You must have Admin privileges to access this!");
        return res.redirect("/listings");
    }
    next();
};

module.exports.isOwner = async (req, res, next) => {
    const { id } = req.params;
    try {
        const listing = await Listing.findById(id);
        if (!listing) {
            req.flash("error", "Listing not found");
            return res.redirect("/listings");
        }

        const isUserAdmin = checkIsAdmin(req.user);
        const isListingOwner = req.user && listing.owner && listing.owner.toString() === req.user._id.toString();

        if (!isListingOwner && !isUserAdmin) {
            req.flash("error", "You do not have permission to do that");
            return res.redirect(`/listings/${id}`);
        }
        next();
    } catch (err) {
        next(err);
    }
};

module.exports.isReviewAuthor = async (req, res, next) => {
    const { reviewId, id } = req.params;
    try {
        const review = await Review.findById(reviewId);
        if (!review) {
            req.flash("error", "Review not found");
            return res.redirect(`/listings/${id}`);
        }

        const isUserAdmin = checkIsAdmin(req.user);
        const isAuthor = req.user && review.author && review.author.toString() === req.user._id.toString();

        if (!isAuthor && !isUserAdmin) {
            req.flash("error", "You do not have permission to do that");
            return res.redirect(`/listings/${id}`);
        }
        next();
    } catch (err) {
        next(err);
    }
};
