const Listing = require("../models/listing");
const Review = require("../models/review");
const User = require("../models/user");

module.exports.renderDashboard = async (req, res) => {
    const listings = await Listing.find({}).populate("owner").populate({
        path: "reviews",
        populate: { path: "author" }
    });

    const reviewsWithListings = [];
    for (const listing of listings) {
        if (listing.reviews && listing.reviews.length > 0) {
            for (const review of listing.reviews) {
                reviewsWithListings.push({
                    review,
                    listing
                });
            }
        }
    }

    const usersCount = await User.countDocuments();

    res.render("admin/dashboard.ejs", {
        listings,
        reviewsWithListings,
        listingsCount: listings.length,
        reviewsCount: reviewsWithListings.length,
        usersCount
    });
};

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing deleted by Admin!");
    res.redirect("/admin");
};

module.exports.destroyReview = async (req, res) => {
    let { listingId, reviewId } = req.params;
    await Listing.findByIdAndUpdate(listingId, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review deleted by Admin!");
    res.redirect("/admin");
};
