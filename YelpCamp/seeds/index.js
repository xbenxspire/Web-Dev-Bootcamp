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

// Array of existing image public IDs in Cloudinary YelpCamp folder with photographer credits and descriptions
const campImages = [
    { id: 'wei-pan-Ta0A1miYZKc-unsplash_smcjqy', credit: 'Wei Pan on Unsplash', description: 'Illuminated tent under a starry night sky with mountains in the background' },
    { id: 'zach-betten-K9olx8OF36A-unsplash_ppvcyu', credit: 'Zach Betten on Unsplash', description: 'Campsite with tents near a serene lake surrounded by pine trees' },
    { id: 'joshua-gresham-qmZF9CptLKs-unsplash_na5rgj', credit: 'Joshua Gresham on Unsplash', description: 'Cozy campfire with logs as seats, surrounded by tall trees' },
    { id: 'dino-reichmuth-5Rhl-kSRydQ-unsplash_iwr6mp', credit: 'Dino Reichmuth on Unsplash', description: 'Tent on a cliff overlooking a misty valley at sunrise' },
    { id: 'jeremy-thomas-WaNZvXEnYok-unsplash_tccpqn', credit: 'Jeremy Thomas on Unsplash', description: 'Northern lights dancing over a lone tent in a snowy landscape' },
    { id: 'sebastian-marx-IejSZKGu1mY-unsplash_dajm5p', credit: 'Sebastian Marx on Unsplash', description: 'Campsite with multiple tents in a grassy field near a forest' },
    { id: 'denys-nevozhai-63Znf38gnXk-unsplash_plurdm', credit: 'Denys Nevozhai on Unsplash', description: 'Tent perched on a rocky outcrop overlooking a vast mountain range' },
    { id: 'jack-sloop-qelGaL2OLyE-unsplash_xfa3jq', credit: 'Jack Sloop on Unsplash', description: 'Hammock strung between trees with a scenic lake view' },
    { id: 'andreas-ronningen-i9FLJwYhVQs-unsplash_dwfxd7', credit: 'Andreas Ronningen on Unsplash', description: 'Tent illuminated from within, set against a backdrop of snow-capped mountains' },
    { id: 'vadim-sadovski-scWIbhdNG_w-unsplash_n10dvy', credit: 'Vadim Sadovski on Unsplash', description: 'Milky Way arching over a solitary tent in a desert landscape' },
    { id: 'toomas-tartes-qaTPg_iV4wk-unsplash_g8aj92', credit: 'Toomas Tartes on Unsplash', description: 'Campfire with marshmallows roasting on sticks, surrounded by people' },
    { id: 'rory-mckeever-7iSv7naOlk8-unsplash_dbgco6', credit: 'Rory McKeever on Unsplash', description: 'Tent on a wooden platform overlooking a misty forest valley' },
    { id: 'eugene-ga-FjPLjD5cDDU-unsplash_nkti12', credit: 'Eugene Ga on Unsplash', description: 'Campsite with multiple tents near a calm lake reflecting the sky' },
    { id: 'pj-gal-szabo-vkyAx0yGdIM-unsplash_nzgpuz', credit: 'PJ Gal-Szabo on Unsplash', description: 'Person sitting by a campfire at night with a starry sky above' },
    { id: 'bernard-AghUTwUuD0k-unsplash_sakqjd', credit: 'Bernard on Unsplash', description: 'Tent on a beach with a colorful sunset over the ocean' },
    { id: 'lex-sirikiat-oT4hTqWoZ6M-unsplash_mowime', credit: 'Lex Sirikiat on Unsplash', description: 'Aerial view of a campsite surrounded by autumn-colored forest' },
    { id: 'yoann-boyer-I6Xozma9Bzo-unsplash_zn04ux', credit: 'Yoann Boyer on Unsplash', description: 'Person standing on a cliff edge overlooking a vast mountain landscape' },
    { id: 'andrew-scofield-OivhEmfO-kk-unsplash_stkdkl', credit: 'Andrew Scofield on Unsplash', description: 'Tent pitched on a sandy beach with turquoise waters in the background' },
    { id: 'keghan-crossland-qBX6EMdy0a4-unsplash_bsddmg', credit: 'Keghan Crossland on Unsplash', description: 'Campsite with a vintage camper van parked near a forest' },
    { id: 'rory-mckeever-GxJnOzrybFw-unsplash_jigpnl', credit: 'Rory McKeever on Unsplash', description: 'Person sitting on a log by a campfire, enjoying a scenic mountain view' },
    { id: 'theodor-vasile-EVkrWtZPsio-unsplash_teko7h', credit: 'Theodor Vasile on Unsplash', description: 'Tent illuminated at night with a starry sky and silhouetted mountains' },
    { id: 'elijah-austin-FhDyEDf2mLo-unsplash_xyndfq', credit: 'Elijah Austin on Unsplash', description: 'Campsite with multiple tents in a clearing surrounded by tall pine trees' },
    { id: 'tim-foster-v6063AyCAt8-unsplash_um3clr', credit: 'Tim Foster on Unsplash', description: 'Person sitting on a cliff edge, watching a colorful sunset over mountains' },
    { id: 'scott-goodwill-y8Ngwq34_Ak-unsplash_nmqy0e', credit: 'Scott Goodwill on Unsplash', description: 'Tent pitched on a grassy hill with a panoramic view of rolling hills' },
    { id: 'chris-schog-EnCaUE4QNOw-unsplash_clcts9', credit: 'Chris Schog on Unsplash', description: 'Campfire with people gathered around, sharing stories under the stars' }
];

// Add this function to generate descriptions
function generateDescription(city, state) {
    const landscapes = [
        'rolling hills', 'lush forests', 'scenic lakes', 'winding rivers', 'expansive prairies',
        'rugged mountains', 'coastal beaches', 'desert landscapes', 'verdant valleys',
        'alpine meadows', 'cascading waterfalls', 'pristine wetlands', 'ancient redwood groves',
        'dramatic canyons', 'serene hot springs', 'wildflower-covered fields', 'glacial valleys',
        'towering cliffs', 'crystal-clear streams', 'misty rainforests',
        'subalpine forests', 'tidal estuaries', 'volcanic formations', 'karst landscapes',
        'barrier islands', 'coral reefs', 'geothermal basins', 'sandstone arches',
        'painted deserts', 'old-growth forests'
    ];
    const activities = [
        'hiking', 'fishing', 'bird watching', 'stargazing', 'kayaking',
        'rock climbing', 'mountain biking', 'wildlife spotting', 'photography',
        'canoeing', 'whitewater rafting', 'horseback riding', 'geocaching',
        'nature walks', 'swimming', 'stand-up paddleboarding', 'bouldering',
        'foraging', 'outdoor yoga', 'plein air painting',
        'backcountry skiing', 'snowshoeing', 'ice climbing', 'spelunking',
        'tide pooling', 'sandboarding', 'fly fishing', 'orienteering',
        'wilderness survival training', 'night sky photography'
    ];
    const attractions = [
        'local wineries', 'historical sites', 'charming downtown', 'farmers markets', 'art galleries',
        'scenic drives', 'state parks', 'hot springs', 'cultural festivals',
        'national monuments', 'ghost towns', 'natural bridges', 'ancient petroglyphs',
        'wildlife refuges', 'botanical gardens', 'dark sky preserves', 'scenic byways',
        'historic lighthouses', 'fossil beds', 'native american heritage sites',
        'geologic wonders', 'alpine lakes', 'lava tube caves', 'wild and scenic rivers',
        'historic battlefields', 'working ranches', 'abandoned mining towns',
        'world-class observatories', 'living history museums', 'bison herds'
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

        `Discover your next favorite camping spot in ${city}, ${state}, where ${landscape1} and ${landscape2} create a outdoor lover's dream. This campground is your home base for exciting ${activity1} and leisurely ${activity2}. With ${attraction} nearby, ${city} offers a perfect mix of natural wonders and local charm.`,

        `Explore the untamed wilderness of ${city}, ${state}, where ${landscape1} stretch as far as the eye can see. This campground offers a true back-to-nature experience with opportunities for ${activity1} and ${activity2}. Don't miss the chance to visit ${attraction} and create memories that will last a lifetime.`,

        `Discover the raw beauty of ${city}, ${state}, a hidden treasure nestled in the heart of ${landscape1}. Whether you're an experienced outdoorsman or a first-time camper, you'll find plenty to love here, from ${activity1} to exploring ${attraction}. Let the tranquility of nature rejuvenate your spirit.`,

        `Experience camping at its finest in ${city}, ${state}, where ${landscape1} and ${landscape2} create a natural wonderland. This campground is your gateway to adventure, offering world-class ${activity1} and easy access to ${attraction}. Immerse yourself in the great outdoors and reconnect with nature.`,

        `Escape to the unspoiled beauty of ${city}, ${state}, a camper's paradise surrounded by ${landscape1}. Here, you can challenge yourself with ${activity1}, relax with ${activity2}, or explore the fascinating ${attraction}. Create your own adventure in this outdoor playground.`,

        `Welcome to ${city}, ${state}, where the spirit of adventure comes alive amidst ${landscape1} and ${landscape2}. This campground is your basecamp for exploration, offering opportunities for ${activity1} and ${activity2}. With ${attraction} nearby, you'll never run out of things to discover.`,

        `Uncover the natural wonders of ${city}, ${state}, a camping destination that boasts both ${landscape1} and ${landscape2}. Whether you're here for the world-class ${activity1} or to explore ${attraction}, you'll find that this campground exceeds all expectations. Prepare for an unforgettable outdoor experience.`,

        `Step into a world of outdoor wonder in ${city}, ${state}, where ${landscape1} set the stage for an epic camping adventure. Engage in exhilarating ${activity1}, unwind with ${activity2}, or take a day trip to ${attraction}. Here, every day brings a new opportunity for discovery and adventure.`,

        `Immerse yourself in the pristine wilderness of ${city}, ${state}, a camper's dream nestled among ${landscape1}. This campground offers the perfect blend of solitude and adventure, with opportunities for ${activity1} and easy access to ${attraction}. Reconnect with nature and yourself in this outdoor paradise.`,

        `Experience the majesty of the great outdoors in ${city}, ${state}, where ${landscape1} and ${landscape2} create a breathtaking natural tapestry. This campground is your ticket to adventure, offering world-class ${activity1} and proximity to ${attraction}. Create memories that will last a lifetime in this outdoor wonderland.`,

        `Discover the untamed beauty of ${city}, ${state}, a camping destination that showcases the best of ${landscape1}. Whether you're here for the challenging ${activity1}, the serene ${activity2}, or to explore ${attraction}, you'll find that this campground offers something for every outdoor enthusiast. Prepare to be amazed by the raw beauty of nature.`
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
                            photographer: randomImage.credit,
                            description: randomImage.description
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