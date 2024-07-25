// This file defines the User model schema for MongoDB
// It uses passport-local-mongoose for authentication
// It includes fields for username, email, resetPasswordToken, and resetPasswordExpires

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);