// Import required modules
const Campground = require('../models/campground');
const maptiler = require('@maptiler/client');
const fetch = require('node-fetch');
maptiler.config.apiKey = process.env.MAPTILER_API_KEY;
maptiler.config.fetch = fetch;
const { cloudinary } = require("../cloudinary");

// Helper function to convert state abbreviations to full names
const stateAbbreviations = {
    'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
    'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
    'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
    'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
    'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
    'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
    'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
    'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
    'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
    'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming'
};

function convertStateAbbreviation(state) {
    return stateAbbreviations[state.toUpperCase()] || state;
}

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
        const { city, state } = req.body.campground;
        const fullStateName = convertStateAbbreviation(state);
        const location = `${city},${fullStateName}`;
        const geoData = await maptiler.geocoding.forward(location, {
            limit: 1,
            types: ['place']
        });

        if (!geoData.features.length) {
            throw new Error('Location not found. Please try a more specific city and state.');
        }

        const cityFeature = geoData.features[0];

        const campground = new Campground(req.body.campground);
        campground.geometry = cityFeature.geometry;
        campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
        campground.author = req.user._id;
        await campground.save();
        console.log('Saved campground:', campground);
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
    const campground = await Campground.findById(id);

    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }

    // Update campground fields
    campground.title = req.body.campground.title;
    campground.city = req.body.campground.city;
    campground.state = req.body.campground.state;
    campground.description = req.body.campground.description;
    campground.price = req.body.campground.price;

    // Update geometry using MapTiler API
    try {
        const fullStateName = convertStateAbbreviation(req.body.campground.state);
        const location = `${req.body.campground.city}, ${fullStateName}, USA`;
        const geoData = await maptiler.geocoding.forward(location, {
            limit: 5,
            types: ['place', 'locality', 'neighborhood']  // Include more types to improve accuracy
        });

        if (!geoData.features.length) {
            throw new Error('Location not found. Please try a more specific city and state.');
        }

        // Find the correct city from the results
        const cityFeature = geoData.features.find(feature =>
            feature.place_name.toLowerCase().includes(req.body.campground.city.toLowerCase()) &&
            (feature.place_name.toLowerCase().includes(fullStateName.toLowerCase()) || feature.place_name.toLowerCase().includes(req.body.campground.state.toLowerCase()))
        );

        if (!cityFeature) {
            throw new Error('Unable to find the specified city. Please try a different city name.');
        }

        campground.geometry = cityFeature.geometry;
    } catch (error) {
        console.error('Error updating campground location:', error);
        req.flash('error', error.message);
        return res.redirect(`/campgrounds/${id}/edit`);
    }

    // Handle new images
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs);

    // Handle image deletion
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        campground.images = campground.images.filter(img => !req.body.deleteImages.includes(img.filename));
    }

    await campground.save();
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}

// Controller to delete a campground
module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground')
    res.redirect('/campgrounds');
}