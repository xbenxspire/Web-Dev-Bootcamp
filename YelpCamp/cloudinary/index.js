// Import the Cloudinary library
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// Configure Cloudinary with environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

// Create a new function to upload files to Cloudinary
const streamUpload = (buffer) => {
    return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream(
            {
                folder: 'YelpCamp',
                allowed_formats: ['jpeg', 'png', 'jpg']
            },
            (error, result) => {
                if (result) {
                    resolve(result);
                } else {
                    reject(error);
                }
            }
        );
        streamifier.createReadStream(buffer).pipe(stream);
    });
};

// Export the configured cloudinary and storage objects
module.exports = {
    cloudinary,
    streamUpload
}
