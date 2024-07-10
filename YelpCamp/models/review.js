// Import the mongoose library for MongoDB interaction
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema for a review
const reviewSchema = new Schema({
    body: String,     // The text content of the review
    rating: Number,   // The numerical rating given in the review
    author: {
        type: Schema.Types.ObjectId,  // Reference to the User who wrote this review
        ref: 'User'
    }
});

// Create and export the Review model
module.exports = mongoose.model("Review", reviewSchema);