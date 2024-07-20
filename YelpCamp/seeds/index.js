// Import required modules
require('dotenv').config();
const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

// Connect to MongoDB
mongoose.set('strictQuery', false);
mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Set up database connection events
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

// Helper function to select a random element from an array
const sample = array => array[Math.floor(Math.random() * array.length)];

// Array of existing image public IDs in Cloudinary YelpCamp folder with photographer credits
const campImages = [
    { id: 'wei-pan-Ta0A1miYZKc-unsplash_smcjqy', credit: 'Wei Pan on Unsplash' },
    { id: 'zach-betten-K9olx8OF36A-unsplash_ppvcyu', credit: 'Zach Betten on Unsplash' },
    { id: 'joshua-gresham-qmZF9CptLKs-unsplash_na5rgj', credit: 'Joshua Gresham on Unsplash' },
    { id: 'dino-reichmuth-5Rhl-kSRydQ-unsplash_iwr6mp', credit: 'Dino Reichmuth on Unsplash' },
    { id: 'jeremy-thomas-WaNZvXEnYok-unsplash_tccpqn', credit: 'Jeremy Thomas on Unsplash' },
    { id: 'sebastian-marx-IejSZKGu1mY-unsplash_dajm5p', credit: 'Sebastian Marx on Unsplash' },
    { id: 'denys-nevozhai-63Znf38gnXk-unsplash_plurdm', credit: 'Denys Nevozhai on Unsplash' },
    { id: 'jack-sloop-qelGaL2OLyE-unsplash_xfa3jq', credit: 'Jack Sloop on Unsplash' },
    { id: 'andreas-ronningen-i9FLJwYhVQs-unsplash_dwfxd7', credit: 'Andreas Ronningen on Unsplash' },
    { id: 'vadim-sadovski-scWIbhdNG_w-unsplash_n10dvy', credit: 'Vadim Sadovski on Unsplash' },
    { id: 'toomas-tartes-qaTPg_iV4wk-unsplash_g8aj92', credit: 'Toomas Tartes on Unsplash' },
    { id: 'rory-mckeever-7iSv7naOlk8-unsplash_dbgco6', credit: 'Rory McKeever on Unsplash' },
    { id: 'eugene-ga-FjPLjD5cDDU-unsplash_nkti12', credit: 'Eugene Ga on Unsplash' },
    { id: 'pj-gal-szabo-vkyAx0yGdIM-unsplash_nzgpuz', credit: 'PJ Gal-Szabo on Unsplash' },
    { id: 'bernard-AghUTwUuD0k-unsplash_sakqjd', credit: 'Bernard on Unsplash' },
    { id: 'lex-sirikiat-oT4hTqWoZ6M-unsplash_mowime', credit: 'Lex Sirikiat on Unsplash' },
    { id: 'yoann-boyer-I6Xozma9Bzo-unsplash_zn04ux', credit: 'Yoann Boyer on Unsplash' },
    { id: 'andrew-scofield-OivhEmfO-kk-unsplash_stkdkl', credit: 'Andrew Scofield on Unsplash' },
    { id: 'keghan-crossland-qBX6EMdy0a4-unsplash_bsddmg', credit: 'Keghan Crossland on Unsplash' },
    { id: 'rory-mckeever-GxJnOzrybFw-unsplash_jigpnl', credit: 'Rory McKeever on Unsplash' },
    { id: 'theodor-vasile-EVkrWtZPsio-unsplash_teko7h', credit: 'Theodor Vasile on Unsplash' },
    { id: 'elijah-austin-FhDyEDf2mLo-unsplash_xyndfq', credit: 'Elijah Austin on Unsplash' },
    { id: 'tim-foster-v6063AyCAt8-unsplash_um3clr', credit: 'Tim Foster on Unsplash' },
    { id: 'scott-goodwill-y8Ngwq34_Ak-unsplash_nmqy0e', credit: 'Scott Goodwill on Unsplash' },
    { id: 'chris-schog-EnCaUE4QNOw-unsplash_clcts9', credit: 'Chris Schog on Unsplash' }
];

// Add this function to generate descriptions
function generateDescription(city, state) {
    const landscapes = [
        'rolling hills', 'lush forests', 'scenic lakes', 'winding rivers', 'expansive prairies',
        'rugged mountains', 'coastal beaches', 'desert landscapes', 'verdant valleys',
        'alpine meadows', 'cascading waterfalls', 'pristine wetlands', 'ancient redwood groves',
        'dramatic canyons', 'serene hot springs', 'wildflower-covered fields', 'glacial valleys',
        'towering cliffs', 'crystal-clear streams', 'misty rainforests'
    ];
    const activities = [
        'hiking', 'fishing', 'bird watching', 'stargazing', 'kayaking',
        'rock climbing', 'mountain biking', 'wildlife spotting', 'photography',
        'canoeing', 'whitewater rafting', 'horseback riding', 'geocaching',
        'nature walks', 'swimming', 'stand-up paddleboarding', 'bouldering',
        'foraging', 'outdoor yoga', 'plein air painting'
    ];
    const attractions = [
        'local wineries', 'historical sites', 'charming downtown', 'farmers markets', 'art galleries',
        'scenic drives', 'state parks', 'hot springs', 'cultural festivals',
        'national monuments', 'ghost towns', 'natural bridges', 'ancient petroglyphs',
        'wildlife refuges', 'botanical gardens', 'dark sky preserves', 'scenic byways',
        'historic lighthouses', 'fossil beds', 'native american heritage sites'
    ];

    const landscape1 = sample(landscapes);
    const landscape2 = sample(landscapes.filter(l => l !== landscape1));
    const activity1 = sample(activities);
    const activity2 = sample(activities.filter(a => a !== activity1));
    const attraction = sample(attractions);

    const templates = [
        `Discover the hidden gem of ${city}, ${state}, nestled among ${landscape1}. This campground offers excellent opportunities for ${activity1} and is just a short drive from ${attraction}. Experience the unique blend of natural beauty and local charm that makes ${city} a perfect destination for outdoor enthusiasts and culture seekers alike.`,

        `Escape to the serene beauty of ${city}, ${state}, where ${landscape1} and ${landscape2} create a picturesque backdrop for your camping adventure. Indulge in ${activity1} or try your hand at ${activity2} before exploring the nearby ${attraction}. ${city} promises an unforgettable outdoor experience for nature lovers of all ages.`,

        `Welcome to ${city}, ${state}, a camper's paradise surrounded by stunning ${landscape1}. Whether you're passionate about ${activity1} or eager to explore ${attraction}, this campground offers something for everyone. Immerse yourself in the natural wonders and rich culture of ${city} for a truly memorable getaway.`,

        `Experience the great outdoors in ${city}, ${state}, where ${landscape1} meet ${landscape2} in a breathtaking display of nature's artistry. This campground is a haven for ${activity1} enthusiasts and those looking to discover ${attraction}. Let the beauty of ${city} inspire your next adventure.`,

        `Unwind in the heart of ${city}, ${state}, a hidden oasis amidst ${landscape1}. From exhilarating ${activity1} to peaceful ${activity2}, this campground caters to all outdoor passions. Don't miss the chance to visit ${attraction} and create lasting memories in the enchanting surroundings of ${city}.`,

        `Embark on a journey to ${city}, ${state}, where adventure awaits at every turn. Nestled in ${landscape1}, this campground is your gateway to thrilling ${activity1} and serene ${activity2}. Explore the wonders of ${attraction} and fall in love with the diverse beauty of ${city}.`,

        `Find your slice of paradise in ${city}, ${state}, a captivating destination boasting ${landscape1} and ${landscape2}. This campground is a launchpad for exciting ${activity1} and relaxing ${activity2}. Discover the local flavor at ${attraction} and see why ${city} is a favorite among outdoor enthusiasts.`,

        `Retreat to the natural splendor of ${city}, ${state}, where ${landscape1} provide a stunning backdrop for your camping adventure. Engage in thrilling ${activity1} or unwind with peaceful ${activity2} before venturing to ${attraction}. ${city} offers the perfect blend of excitement and tranquility for your outdoor escape.`,

        `Immerse yourself in the wild beauty of ${city}, ${state}, a camping destination that boasts incredible ${landscape1}. From heart-pumping ${activity1} to soul-soothing ${activity2}, this campground has it all. Don't forget to check out ${attraction} for a taste of local culture in the midst of nature's grandeur.`,

        `Discover your next favorite camping spot in ${city}, ${state}, where ${landscape1} and ${landscape2} create a outdoor lover's dream. This campground is your home base for exciting ${activity1} and leisurely ${activity2}. With ${attraction} nearby, ${city} offers a perfect mix of natural wonders and local charm.`
    ];

    return sample(templates);
}

// Main function to seed the database
const seedDB = async () => {
    try {
        await Campground.deleteMany({});

        for (let i = 0; i < 50; i++) {
            const randomCity = sample(cities);
            const price = Math.floor(Math.random() * 20) + 10;

            const camp = new Campground({
                author: '6695f89c2a448c451c36e3b9',
                location: `${randomCity.city}, ${randomCity.state}`,
                title: `${sample(descriptors)} ${sample(places)}`,
                description: generateDescription(randomCity.city, randomCity.state),
                price,
                geometry: {
                    type: "Point",
                    coordinates: [
                        randomCity.longitude,
                        randomCity.latitude,
                    ]
                },
                images: [
                    (() => {
                        const randomImage = sample(campImages);
                        return {
                            url: cloudinary.url(randomImage.id, { width: 1600, height: 900, crop: "fill" }),
                            filename: randomImage.id,
                            photographer: randomImage.credit
                        };
                    })()
                ]
            });
            await camp.save();
            console.log(`Added campground: ${camp.title} in ${camp.location}`);
        }
    } catch (error) {
        console.error("Error seeding database:", error);
    }
}

// Run the seeding function and close the database connection when done
seedDB().then(() => {
    mongoose.connection.close();
})