import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';

// ===== Types =====
type RequestSource = 'body' | 'params' | 'query';

interface ValidationError {
    field: string;
    message: string;
}

interface MultipleSchemas {
    body?: ZodSchema;
    params?: ZodSchema;
    query?: ZodSchema;
}

type ValidationMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => void | Response;

/**
 * Validation middleware factory
 * Creates Express middleware that validates request data against a Zod schema
 * 
 * @param schema - Zod validation schema
 * @param source - Where to validate from (body, params, or query)
 * @returns Express middleware function
 */
export const validateRequest = (
    schema: ZodSchema,
    source: RequestSource = 'body'
): ValidationMiddleware => {
    return (req, res, next) => {
        try {
            // Validate the specified part of the request
            const validated = schema.parse(req[source]);

            // Replace request data with validated (and potentially transformed) data
            (req as unknown as Record<string, unknown>)[source] = validated;

            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                // Format Zod errors into a user-friendly structure
                const errors: ValidationError[] = error.errors.map((err) => ({
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
            const err = error as Error;
            return res.status(500).json({
                success: false,
                message: 'Validation failed',
                error: err.message
            });
        }
    };
};

/**
 * Validate MongoDB ObjectId in params
 * Commonly used for routes like /api/workspaces/:workspaceId
 * 
 * @param paramName - Name of the param to validate
 * @returns Express middleware function
 */
export const validateObjectId = (paramName: string): ValidationMiddleware => {
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
 * @param schemas - Object with body, params, and/or query schemas
 * @returns Express middleware function
 */
export const validateMultiple = (schemas: MultipleSchemas): ValidationMiddleware => {
    return (req, res, next) => {
        try {
            // Validate body if schema provided
            if (schemas.body) {
                req.body = schemas.body.parse(req.body);
            }

            // Validate params if schema provided
            if (schemas.params) {
                (req as unknown as { params: unknown }).params = schemas.params.parse(req.params);
            }

            // Validate query if schema provided
            if (schemas.query) {
                (req as unknown as { query: unknown }).query = schemas.query.parse(req.query);
            }

            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                const errors: ValidationError[] = error.errors.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message
                }));

                return res.status(400).json({
                    success: false,
                    message: 'Validation error',
                    errors
                });
            }

            const err = error as Error;
            return res.status(500).json({
                success: false,
                message: 'Validation failed',
                error: err.message
            });
        }
    };
};
