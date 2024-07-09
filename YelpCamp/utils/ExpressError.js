// This file defines a custom error class that extends the built-in Error class
// It's used for creating and handling custom errors in the application
class ExpressError extends Error {
    constructor(message, statusCode) {
        super();
        this.message = message;
        this.statusCode = statusCode;
    }
}

module.exports = ExpressError;