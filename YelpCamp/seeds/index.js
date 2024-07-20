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
                description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque molestiae deserunt!',
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