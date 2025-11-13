// Load environment variables from .env file in development mode
// Production environments should have these set in their hosting platform
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

// Import required modules
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');

// Mongoose 7+ requires explicit strictQuery setting to avoid deprecation warnings
// true = filters out fields not in schema, false = allows additional fields
mongoose.set('strictQuery', true);
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const Campground = require('./models/campground');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');

const MongoStore = require('connect-mongo');

// MongoDB connection URL - uses production DB if available, otherwise local
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';

// Mongoose 8+ removed deprecated options (useNewUrlParser, useUnifiedTopology)
// These are now default behavior, so simplified connection syntax is used
mongoose.connect(dbUrl)
    .then(() => console.log('Database connected'))
    .catch(err => {
        console.log('MongoDB connection error:');
        console.error(err);
    });

// Handle database connection events
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));

// Initialize Express app
const app = express();

// Set up view engine
app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

// Parse URL-encoded request bodies (form submissions)
app.use(express.urlencoded({ extended: true }));

// Allow PUT/DELETE requests via ?_method=PUT query parameter
app.use(methodOverride('_method'));

// Serve static files (CSS, JS, images) from public directory
app.use(express.static(path.join(__dirname, 'public')))

// Prevent MongoDB injection attacks by sanitizing user input
// Replaces prohibited characters like $ and . with underscores
app.use(mongoSanitize({
    replaceWith: '_'
}))

// Session secret for signing cookies - should be complex in production
const secret = process.env.SECRET || 'thisshouldbeabettersecret!';

// Store sessions in MongoDB instead of memory for persistence across server restarts
// touchAfter: 24*60*60 = only update session in DB once per 24 hours (unless data changes)
const store = MongoStore.create({
    mongoUrl: dbUrl,
    secret: secret,
    touchAfter: 24 * 60 * 60
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})

// Session configuration
const sessionConfig = {
    store,                    // Use MongoDB store defined above
    name: 'session',          // Custom cookie name (hides default 'connect.sid')
    secret: secret,           // Secret for signing session ID cookie
    resave: false,            // Don't save session if unmodified
    saveUninitialized: true,  // Save new sessions even if not modified
    cookie: {
        httpOnly: true,       // Prevent client-side JS from accessing cookie (XSS protection)
        // secure: true,      // TODO: Enable in production to require HTTPS
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,  // Absolute expiry: 7 days from now
        maxAge: 1000 * 60 * 60 * 24 * 7                 // Sliding expiry: 7 days from last access
    }
}

// Enable session middleware (must come before passport and flash)
app.use(session(sessionConfig));

// Enable flash messages for temporary notifications between requests
app.use(flash());

// Enable Helmet security headers (configured with CSP below)
app.use(helmet());

// Content Security Policy: Whitelist trusted sources to prevent XSS attacks
// CSP blocks unauthorized scripts, styles, and resources from loading

// Trusted CDNs for JavaScript libraries (Bootstrap, FontAwesome, MapTiler)
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/",
];

// Trusted CDNs for stylesheets
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/",
];

// Trusted API endpoints for AJAX requests
const connectSrcUrls = [
    "https://api.maptiler.com/",
];

// Trusted font providers
const fontSrcUrls = [
    "https://fonts.gstatic.com/",
];

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dttpm6icr/",
                "https://images.unsplash.com/",
                "https://api.maptiler.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

// Initialize Passport authentication middleware
app.use(passport.initialize());
app.use(passport.session());  // Enable persistent login sessions

// Configure local username/password authentication strategy
// User.authenticate() is provided by passport-local-mongoose plugin
passport.use(new LocalStrategy(User.authenticate()));

// Define how to store user info in session (store user._id)
passport.serializeUser(User.serializeUser());

// Define how to retrieve full user object from session (fetch from DB using user._id)
passport.deserializeUser(User.deserializeUser());

// Make user and flash messages available to all views
app.use((req, res, next) => {
    res.locals.currentUser = req.user;                    // Currently logged-in user (or undefined)
    res.locals.success = req.flash('success');            // Success messages
    res.locals.error = req.flash('error');                // Error messages
    res.locals.mapTilerKey = process.env.MAPTILER_API_KEY; // API key for map functionality
    next();
});

// Mount route handlers
app.use('/', userRoutes);                              // Authentication routes (login, register, logout)
app.use('/campgrounds', campgroundRoutes)              // Campground CRUD operations
app.use('/campgrounds/:id/reviews', reviewRoutes)      // Review CRUD operations (nested under campgrounds)

app.get('/', (req, res) => {
    console.log('Flash messages:', req.flash('success'));
    res.render('home');
});

app.get('/users/profile', async (req, res) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'You must be signed in to view your profile');
        return res.redirect('/login');
    }
    try {
        const userCampgrounds = await Campground.find({ author: req.user._id });
        const campgrounds = {
            features: userCampgrounds.map(campground => {
                return {
                    type: "Feature",
                    geometry: campground.geometry,
                    properties: {
                        popUpMarkup: `<strong><a href="/campgrounds/${campground._id}">${campground.title}</a></strong>
                                  <p>${campground.description.substring(0, 20)}...</p>`
                    }
                };
            })
        };
        res.render('users/profile', { userCampgrounds, campgrounds });
    } catch (error) {
        console.error(error);
        req.flash('error', 'Unable to load profile');
        res.redirect('/campgrounds');
    }
});

app.get('/citations', (req, res) => {
    res.render('citations');
});

app.get('/about', (req, res) => {
    res.render('about');
});

// Catch-all route for undefined routes (must be after all other routes)
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
});

// Global error handler (must have 4 parameters: err, req, res, next)
// Catches all errors from routes and middleware, renders error page
app.use((err, req, res, next) => {
    console.error(err);
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!';
    res.status(statusCode).render('error', { err, statusCode });
})

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Serving on port ${port}`)
}).on('error', (e) => {
    console.error('Error starting server:', e);
});

// Polyfill: Make fetch API available in Node.js (native in browsers)
// Required for server-side API calls to external services
const fetch = require('node-fetch');
global.fetch = fetch;

// Export database URL for use in tests or other modules
module.exports = { dbUrl };
