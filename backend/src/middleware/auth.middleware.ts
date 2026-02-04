import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt.js';
import User from '../models/User.js';
import { Types } from 'mongoose';

// ===== Types =====
// Extend Express Request to include user data
export interface AuthenticatedRequest extends Request {
    user?: {
        _id: Types.ObjectId;
        email: string;
        name: string;
        role?: string;
        avatar?: string;
    };
    userId?: Types.ObjectId;
}

type AuthMiddleware = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => Promise<void | Response>;

type SyncMiddleware = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => void | Response;

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
export const authenticate: AuthMiddleware = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No token provided. Authorization denied.'
            });
        }

        // Extract token
        const token = authHeader.split(' ')[1];

        // Verify token
        const decoded = verifyToken(token);

        // Find user and attach to request
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found. Authorization denied.'
            });
        }

        // Attach user to request
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        req.user = user as any;
        req.userId = user._id as Types.ObjectId;

        next();
    } catch (error) {
        const err = error as Error;
        console.error('Auth middleware error:', err.message);

        return res.status(401).json({
            success: false,
            message: err.message || 'Invalid token. Authorization denied.'
        });
    }
};

/**
 * Role-based authorization middleware
 * @param roles - Allowed roles
 */
export const authorize = (...roles: string[]): SyncMiddleware => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        if (req.user.role && !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Insufficient permissions.'
            });
        }

        next();
    };
};

/**
 * Optional authentication middleware
 * Attaches user if token is valid, but doesn't block request
 */
export const optionalAuth: AuthMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const decoded = verifyToken(token);
            const user = await User.findById(decoded.userId).select('-password');

            if (user) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                req.user = user as any;
                req.userId = user._id as Types.ObjectId;
            }
        }
    } catch (error) {
        // Silently fail - token is optional
        const err = error as Error;
        console.log('Optional auth failed:', err.message);
    }

    next();
};

// Alias for backward compatibility
export const protect = authenticate;
