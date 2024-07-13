// Import required models
const Campground = require('../models/campground');
const Review = require('../models/review');

// Controller function to create a new review
module.exports.createReview = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;  // Set the review author to the current user
    campground.reviews.push(review);  // Add the review to the campground's reviews array
    await review.save();  // Save the new review
    await campground.save();  // Save the updated campground
    req.flash('success', 'Created new review!');  // Flash a success message
    res.redirect(`/campgrounds/${campground._id}`);  // Redirect to the campground page
}

// Controller function to delete a review
module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    // Remove the review from the campground's reviews array
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    // Delete the review from the database
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review');  // Flash a success message
    res.redirect(`/campgrounds/${id}`);  // Redirect to the campground page
}