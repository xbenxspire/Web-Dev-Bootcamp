// Import required modules
const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });
const maptiler = require('@maptiler/client');
const fetch = require('node-fetch');

// Configure MapTiler
maptiler.config.apiKey = process.env.MAPTILER_API_KEY;
maptiler.config.fetch = fetch;

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
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

router.put('/:id', isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground));

router.delete('/:id', isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

// Export the router
module.exports = router;