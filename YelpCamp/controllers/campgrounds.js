const Campground = require('../models/campground');
const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;
const { cloudinary, streamUpload } = require("../cloudinary");

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

// Function to convert state input to full name
function convertStateAbbreviation(state) {
    const uppercaseState = state.toUpperCase();
    if (stateAbbreviations.hasOwnProperty(uppercaseState)) {
        return stateAbbreviations[uppercaseState];
    } else {
        // Check if the input is a full state name
        const fullStateName = Object.values(stateAbbreviations).find(
            fullName => fullName.toUpperCase() === uppercaseState
        );
        return fullStateName || state; // Return the found full name or the original input
    }
}

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.createCampground = async (req, res, next) => {
    try {
        const { city, state } = req.body.campground;
        const fullStateName = convertStateAbbreviation(state);
        const location = `${city}, ${fullStateName}, USA`;

        console.log('Geocoding location:', location); // Add this line for debugging

        const geoData = await maptilerClient.geocoding.forward(location, {
            limit: 1,
            types: ['municipality', 'place'],
            language: 'en',
            country: ['US'] // Change this to an array
        });

        console.log('Geocoding response:', geoData); // Add this line for debugging

        if (!geoData.features || geoData.features.length === 0) {
            throw new Error('Unable to find the specified location. Please check your city and state.');
        }

        const campground = new Campground(req.body.campground);
        campground.geometry = geoData.features[0].geometry;
        const uploads = [];
        for (let file of req.files) {
            const result = await streamUpload(file.buffer);
            uploads.push({ url: result.secure_url, filename: result.public_id });
        }
        campground.images = uploads;
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

module.exports.showCampground = async (req, res,) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id)
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    console.log(req.body);
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const { city, state } = campground;
    const fullStateName = convertStateAbbreviation(state);
    const location = `${city}, ${fullStateName}, USA`;
    const geoData = await maptilerClient.geocoding.forward(location, {
        limit: 1,
        types: ['municipality', 'place'],
        language: 'en',
        country: ['US'] // Change this to an array
    });
    campground.geometry = geoData.features[0].geometry;
    if (req.files && req.files.length > 0) {
        const uploads = [];
        for (let file of req.files) {
            const result = await streamUpload(file.buffer);
            uploads.push({ url: result.secure_url, filename: result.public_id });
        }
        campground.images.push(...uploads);
    }
    await campground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground')
    res.redirect('/campgrounds');
}
