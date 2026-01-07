import { z } from 'zod';

/**
 * Validation middleware factory
 * Creates Express middleware that validates request data against a Zod schema
 * 
 * @param {z.ZodSchema} schema - Zod validation schema
 * @param {('body'|'params'|'query')} source - Where to validate from (body, params, or query)
 * @returns {Function} Express middleware function
 */
export const validateRequest = (schema, source = 'body') => {
    return (req, res, next) => {
        try {
            // Validate the specified part of the request
            const validated = schema.parse(req[source]);

            // Replace request data with validated (and potentially transformed) data
            req[source] = validated;

            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                // Format Zod errors into a user-friendly structure
                const errors = error.errors.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message
                }));

                return res.status(400).json({
                    success: false,
                    message: 'Validation error',
                    errors
                });
            }

            // Handle unexpected errors
            return res.status(500).json({
                success: false,
                message: 'Validation failed',
                error: error.message
            });
        }
    };
};

/**
 * Validate MongoDB ObjectId in params
 * Commonly used for routes like /api/workspaces/:workspaceId
 * 
 * @param {string} paramName - Name of the param to validate
 * @returns {Function} Express middleware function
 */
export const validateObjectId = (paramName) => {
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;

    return (req, res, next) => {
        const paramValue = req.params[paramName];

        if (!paramValue || !objectIdRegex.test(paramValue)) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: [{
                    field: paramName,
                    message: `Invalid ${paramName} format`
                }]
            });
        }

        next();
    };
};

/**
 * Validate multiple fields at once
 * Useful for validating both body and params in a single middleware
 * 
 * @param {Object} schemas - Object with body, params, and/or query schemas
 * @returns {Function} Express middleware function
 */
export const validateMultiple = (schemas) => {
    return (req, res, next) => {
        try {
            // Validate body if schema provided
            if (schemas.body) {
                req.body = schemas.body.parse(req.body);
            }

            // Validate params if schema provided
            if (schemas.params) {
                req.params = schemas.params.parse(req.params);
            }

            // Validate query if schema provided
            if (schemas.query) {
                req.query = schemas.query.parse(req.query);
            }

            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                const errors = error.errors.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message
                }));

                return res.status(400).json({
                    success: false,
                    message: 'Validation error',
                    errors
                });
            }

            return res.status(500).json({
                success: false,
                message: 'Validation failed',
                error: error.message
            });
        }
    };
};
