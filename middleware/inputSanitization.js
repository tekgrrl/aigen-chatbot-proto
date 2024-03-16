const createError = require('http-errors');

// Function to sanitize input data
function sanitizeInput(input) {
    if (typeof input === 'string') {
        return input.replace(/<script.*?>.*?<\/script>/ig, '')
                     .replace(/<[\/\!]*?[^<>]*?>/ig, '')
                     .replace(/<style.*?>.*?<\/style>/ig, '')
                     .replace(/<![\s\S]*?--[ \t\n\r]*>/ig, '');
    }
    return input;
}

// Middleware to sanitize all incoming request data
function inputSanitization(req, res, next) {
    try {
        console.log('Sanitizing input data');
        if (req.body) {
            for (const key in req.body) {
                req.body[key] = sanitizeInput(req.body[key]);
            }
        }
        if (req.query) {
            for (const key in req.query) {
                req.query[key] = sanitizeInput(req.query[key]);
            }
        }
        if (req.params) {
            for (const key in req.params) {
                req.params[key] = sanitizeInput(req.params[key]);
            }
        }
        next();
    } catch (error) {
        console.error('Error during input sanitization:', error.message, error.stack);
        next(createError(500, 'Internal Server Error'));
    }
}

module.exports = inputSanitization;