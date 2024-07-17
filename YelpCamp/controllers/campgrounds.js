// Import required modules
const Campground = require('../models/campground');
const maptiler = require('@maptiler/client');
const fetch = require('node-fetch');
maptiler.config.apiKey = process.env.MAPTILER_API_KEY;
maptiler.config.fetch = fetch;
const { cloudinary } = require("../cloudinary");

// Controller to get all campgrounds
module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    campgrounds.forEach(campground => {
        console.log(campground.images);
    });
    res.render('campgrounds/index', { campgrounds });
}

// Controller to render new campground form
module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}

// Controller to create a new campground
module.exports.createCampground = async (req, res, next) => {
    try {
        const geoData = await maptiler.geocoding.forward(req.body.campground.location, { limit: 1 });
        console.log('GeoData:', geoData); // Add this line for debugging

        if (!geoData.features.length) {
            throw new Error('Location not found. Please try a more specific location.');
        }

        const campground = new Campground(req.body.campground);
        campground.geometry = geoData.features[0].geometry;
        campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
        campground.author = req.user._id;
        await campground.save();
        console.log('Saved campground:', campground); // Add this line for debugging
        req.flash('success', 'Successfully made a new campground!');
        res.redirect(`/campgrounds/${campground._id}`);
    } catch (error) {
        console.error('Error creating campground:', error);
        req.flash('error', error.message);
        res.redirect('/campgrounds/new');
    }
}

// Controller to show a specific campground
module.exports.showCampground = async (req, res) => {
    const campground = await Campground.findById(req.params.id)
        .populate({
            path: 'reviews',
            populate: {
                path: 'author'
            }
        })
        .populate('author');
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}

// Controller to render edit form for a campground
module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id)
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}

// Controller to update a campground
module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs);
    await campground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
    }
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`)
}

// Controller to delete a campground
module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground')
    res.redirect('/campgrounds');
}