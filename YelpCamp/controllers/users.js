// Import the User model
const User = require('../models/user');

// Controller function to render the registration form
module.exports.renderRegister = (req, res) => {
    res.render('users/register');
}

// Controller function to handle user registration
module.exports.register = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        // Register the user using Passport's register method
        const registeredUser = await User.register(user, password);
        // Log the user in after successful registration
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Yelp Camp!');
            res.redirect('/campgrounds');
        })
    } catch (e) {
        // If registration fails, flash an error message and redirect
        req.flash('error', e.message);
        res.redirect('register');
    }
}

// Controller function to render the login form
module.exports.renderLogin = (req, res) => {
    res.render('users/login');
}

// Controller function to handle user login
module.exports.login = (req, res) => {
    req.flash('success', 'Welcome back!');
    // Redirect to the previously requested URL or to /campgrounds
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

// Controller function to handle user logout
module.exports.logout = (req, res) => {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
}