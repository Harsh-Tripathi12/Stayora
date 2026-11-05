const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn, isAdmin } = require("../middleware");
const adminController = require("../controllers/admin");

// Admin Dashboard
router.get("/", isLoggedIn, isAdmin, wrapAsync(adminController.renderDashboard));

// Admin Delete Listing
router.delete("/listings/:id", isLoggedIn, isAdmin, wrapAsync(adminController.destroyListing));

// Admin Delete Review
router.delete("/reviews/:listingId/:reviewId", isLoggedIn, isAdmin, wrapAsync(adminController.destroyReview));

module.exports = router;
