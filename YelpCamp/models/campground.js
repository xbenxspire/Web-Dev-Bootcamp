const mongoose = require('mongoose');
const Review = require('./review')
const Schema = mongoose.Schema;

// Define the schema for a campground
const CampgroundSchema = new Schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String,
    // Reference to the User who created this campground
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    // Array of references to Review documents
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});

// Middleware to delete associated reviews when a campground is deleted
CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        // Delete all reviews where the _id is in the deleted campground's reviews array
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

// Create and export the Campground model
module.exports = mongoose.model('Campground', CampgroundSchema);