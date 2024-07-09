// This file contains a utility function for handling async errors
// It wraps async functions to catch any errors and pass them to the error handler
module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(next);
    }
}