// This file contains all the routes for review operations
// It includes routes for creating and deleting reviews
// It's nested under the campground routes

const express = require('express');
const router = express.Router({ mergeParams: true });
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');
const Campground = require('../models/campground');
const Review = require('../models/review');
const reviews = require('../controllers/reviews');
const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');

// Route for creating a new review
// Requires user to be logged in and review to be valid
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview))

// Route for deleting a review
// Requires user to be logged in and to be the author of the review
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

// Export the router for use in the main application
module.exports = router;