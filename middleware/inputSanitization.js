const createError = require('http-errors');

// Function to sanitize input data
function sanitizeInput(input) {
    if (typeof input === 'string') {
        // Remove HTML tags and content within script and style tags
        input = input.replace(/<script[^>]*>[\s\S]*?<\/script>/ig, '')
                 .replace(/<[^>]*>/ig, '')
                 .replace(/<style[^>]*>[\s\S]*?<\/style>/ig, '')
                 .replace(/<!--[\s\S]*?-->/ig, '');

        // Address CWE-1333 by encoding special characters to prevent potential XSS attacks
        input = input.replace(/&/g, '&amp;')
                 .replace(/</g, '&lt;')
                 .replace(/>/g, '&gt;')
                 .replace(/"/g, '&quot;')
                 .replace(/'/g, '&#x27;')
                 .replace(/\//g, '&#x2F;');

        // Address CWE-400 by limiting the length of the input to prevent potential DoS attacks
        if (input.length > 1000) {
            throw new Error('Input is too long');
        }

        // Address CWE-730 by checking if the input is a string type
        if (typeof input !== 'string') {
            throw new Error('Invalid input type');
        }

        return input;
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