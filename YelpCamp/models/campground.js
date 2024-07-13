// Import required modules
const mongoose = require('mongoose');
const Review = require('./review')
const Schema = mongoose.Schema;


// Define schema for image storage
const ImageSchema = new Schema({
    url: String,
    filename: String
});

// Virtual property to generate thumbnail URL
ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});

// Define main Campground schema
const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ],
    imageUrl: String
});



// Middleware to delete associated reviews when a campground is deleted
CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

// Export the Campground model
module.exports = mongoose.model('Campground', CampgroundSchema);