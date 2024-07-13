// Import the Cloudinary library
const cloudinary = require('cloudinary').v2;
// Import CloudinaryStorage from multer-storage-cloudinary
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary with environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

// Create a new CloudinaryStorage instance
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'YelpCamp', // Set the folder name in Cloudinary
        allowedFormats: ['jpeg', 'png', 'jpg'] // Specify allowed image formats
    }
});

// Export the configured cloudinary and storage objects
module.exports = {
    cloudinary,
    storage
}