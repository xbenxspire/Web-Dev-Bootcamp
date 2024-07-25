const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const users = require('../controllers/users');

// Define routes for user registration
router.route('/register')
    .get(users.renderRegister)  // GET route to render the registration form
    .post(catchAsync(users.register));  // POST route to handle user registration

// Define routes for user login
router.route('/login')
    .get(users.renderLogin)  // GET route to render the login form
    .post(passport.authenticate('local', {
        failureFlash: 'Invalid username or password.',
        failureRedirect: '/login'
    }), users.login)  // POST route to handle user login

// Define route for user logout
router.get('/logout', users.logout)  // GET route to handle user logout

// Define routes for forgot password functionality
router.get('/forgot-password', users.renderForgotPassword);
router.post('/forgot-password', users.forgotPassword);
router.get('/reset/:token', users.renderResetPassword);
router.post('/reset/:token', users.resetPassword);

// Export the router to be used in the main app
module.exports = router;