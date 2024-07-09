// This file defines the Review model schema for MongoDB
// It includes fields for the review body and rating
// It's associated with the Campground model

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    body: String,
    rating: Number
});

module.exports = mongoose.model("Review", reviewSchema);
