import { Response, NextFunction, RequestHandler } from 'express';
import { AuthenticatedRequest } from '../types/index.js';

/**
 * Type-safe wrapper for authenticated route handlers.
 * Bridges Express's generic RequestHandler with our custom AuthenticatedRequest type.
 * This avoids using 'as any' throughout the codebase while maintaining type safety.
 */
export type AuthHandler = (
    req: AuthenticatedRequest,
    res: Response,
    next?: NextFunction
) => Promise<void> | void;

export const wrap = (fn: AuthHandler): RequestHandler => fn as RequestHandler;
