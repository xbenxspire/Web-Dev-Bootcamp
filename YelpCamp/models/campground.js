const mongoose = require('mongoose');
const Review = require('./review')
const Schema = mongoose.Schema;

// Example Cloudinary URL for reference
// https://res.cloudinary.com/douqbebwk/image/upload/w_300/v1600113904/YelpCamp/gxgle1ovzd2f3dgcpass.png

// Schema for individual images
const ImageSchema = new Schema({
    url: String,
    filename: String
});

// Virtual property to generate thumbnail URL
ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});

// Options to include virtuals when converting document to JSON
const opts = { toJSON: { virtuals: true } };

// Main Campground Schema
const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
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
    ]
}, opts);

// Virtual property for popup content in map
CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
    <p>${this.description.substring(0, 20)}...</p>`
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