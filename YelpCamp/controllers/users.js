// Import the User model
const User = require('../models/user');
const crypto = require('crypto');
const Mailjet = require('node-mailjet');

const mailjet = new Mailjet({
    apiKey: process.env.MAILJET_API_KEY,
    apiSecret: process.env.MAILJET_SECRET_KEY
});

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

module.exports.renderForgotPassword = (req, res) => {
    res.render('users/forgot-password');
}

module.exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        req.flash('error', 'No account with that email address exists.');
        return res.redirect('/forgot-password');
    }

    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const request = mailjet
        .post("send", { 'version': 'v3.1' })
        .request({
            "Messages": [
                {
                    "From": {
                        "Email": "your-verified-sender@yourdomain.com",
                        "Name": "YelpCamp"
                    },
                    "To": [
                        {
                            "Email": user.email,
                            "Name": user.username
                        }
                    ],
                    "Subject": "YelpCamp Password Reset",
                    "TextPart": `You are receiving this because you (or someone else) have requested the reset of the password for your account.
                    Please click on the following link, or paste this into your browser to complete the process:
                    http://${req.headers.host}/reset/${token}
                    If you did not request this, please ignore this email and your password will remain unchanged.`
                }
            ]
        });

    try {
        await request;
        req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        res.redirect('/forgot-password');
    } catch (error) {
        console.error(error);
        req.flash('error', 'An error occurred while sending the email. Please try again later.');
        res.redirect('/forgot-password');
    }
}

module.exports.renderResetPassword = async (req, res) => {
    const user = await User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() }
    });
    if (!user) {
        req.flash('error', 'Password reset token is invalid or has expired.');
        return res.redirect('/forgot-password');
    }
    res.render('users/reset-password', { token: req.params.token });
}

module.exports.resetPassword = async (req, res) => {
    const user = await User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() }
    });
    if (!user) {
        req.flash('error', 'Password reset token is invalid or has expired.');
        return res.redirect('/forgot-password');
    }
    if (req.body.password === req.body.confirm) {
        await user.setPassword(req.body.password);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        req.logIn(user, (err) => {
            if (err) return next(err);
            req.flash('success', 'Success! Your password has been changed.');
            res.redirect('/campgrounds');
        });
    } else {
        req.flash("error", "Passwords do not match.");
        return res.redirect('back');
    }
}