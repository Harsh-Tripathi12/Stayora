const Listing = require("../models/listing");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken});

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
}

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
        .populate ({
            path: "reviews",
            populate: {
                path: "author",
            },
        })
        .populate("owner");
    if (!listing) {
        req. flash("error", "Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    console. log(listing);
    res.render("listings/show.ejs", { listing });
}

module.exports.createListing = async (req, res, next) =>{
    let response = await geocodingClient
        .forwardGeocode ( {
            query: req.body.listing.location,
            limit: 1,
        })
        .send();

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    console.log('DEBUG createListing req.file =', req.file);
    if (req.file) {
        const uploadedUrl = req.file.path || req.file.secure_url || req.file.url || req.file.location;
        const uploadedFilename = req.file.filename || req.file.public_id || req.file.key || req.file.originalname;
        newListing.image = {
            url: uploadedUrl,
            filename: uploadedFilename,
        };
    } else if (!newListing.image || !newListing.image.url) {
        newListing.image = {
            url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=60",
        };
    }
    console.log('DEBUG newListing.image =', newListing.image);

    const geoFeatures = response.body && response.body.features;
    if (!geoFeatures || !geoFeatures.length) {
        req.flash("error", "Location not found. Please enter a valid location.");
        return res.redirect("/listings/new");
    }
    newListing.geometry = geoFeatures[0].geometry;

        let savedListing = await newListing.save();
        console.log(savedListing);
        req. flash("success", "New Listing Created!");
        res.redirect("/listings");
    }

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_80,w_250");
    res.render("listings/edit.ejs", { listing , originalImageUrl});
};

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true });
    if (req.file) {
        const uploadedUrl = req.file.path || req.file.secure_url || req.file.url || req.file.location;
        const uploadedFilename = req.file.filename || req.file.public_id || req.file.key || req.file.originalname;
        listing.image = {
            url: uploadedUrl,
            filename: uploadedFilename,
        };
        await listing.save();
    }
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console. log(deletedListing);
    req. flash("success", "Listing Deleted!");
    res.redirect("/listings");
};