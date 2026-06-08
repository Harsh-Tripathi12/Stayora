const cloudinary = require("cloudinary");
const CloudinaryStorage = require("multer-storage-cloudinary");

// configure the v2 instance but export the full module so
// multer-storage-cloudinary can access `cloudinary.v2` internally
cloudinary.v2.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "wanderlust_DEV",
        allowed_formats: ["png", "jpg", "jpeg", "webp"],
    },
});

module.exports = {
    cloudinary,
    storage,
};