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
    { id: 'andreas-ronningen-i9FLJwYhVQs-unsplash_dwfxd7', credit: 'Andreas Ronningen on Unsplash' }
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