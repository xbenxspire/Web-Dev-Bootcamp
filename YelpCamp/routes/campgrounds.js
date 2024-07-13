// Import required modules
const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

const Campground = require('../models/campground');

// Define routes for '/' path
router.route('/')
    .get(catchAsync(campgrounds.index)) // GET all campgrounds
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground)) // POST new campground

// GET route for new campground form
router.get('/new', isLoggedIn, campgrounds.renderNewForm)

// Define routes for '/:id' path
router.route('/:id')
    .get(catchAsync(campgrounds.showCampground)) // GET specific campground
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground)) // PUT update campground
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground)); // DELETE campground

// GET route for edit campground form
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))

// Export the router
module.exports = router;