import jwt, { SignOptions } from 'jsonwebtoken';
import env from '../config/env.js'; // Will resolve to env.ts with NodeNext resolution

// ===== Types =====
export interface JwtPayload {
    userId: string;
    email: string;
    name: string;
    role?: string;
    iat?: number;
    exp?: number;
}

interface UserForToken {
    _id: string | { toString(): string };
    email: string;
    name: string;
    role?: string;
}

/**
 * Generate JWT token
 * @param payload - Data to encode in token (usually user id)
 * @returns JWT token
 */
export const generateToken = (payload: object): string => {
    return jwt.sign(payload, env.JWT_SECRET, {
        expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn']
    });
};

/**
 * Verify JWT token
 * @param token - JWT token to verify
 * @returns Decoded token payload
 * @throws Error if token is invalid or expired
 */
export const verifyToken = (token: string): JwtPayload => {
    try {
        return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    } catch (error) {
        const err = error as Error & { name: string };
        if (err.name === 'TokenExpiredError') {
            throw new Error('Token has expired');
        }
        if (err.name === 'JsonWebTokenError') {
            throw new Error('Invalid token');
        }
        throw error;
    }
};

/**
 * Generate access token for user
 * @param user - User object
 * @returns JWT token
 */
export const generateAccessToken = (user: UserForToken): string => {
    return generateToken({
        userId: typeof user._id === 'string' ? user._id : user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role
    });
};

/**
 * Decode token without verification (useful for debugging)
 * @param token - JWT token
 * @returns Decoded token
 */
export const decodeToken = (token: string): JwtPayload | null => {
    return jwt.decode(token) as JwtPayload | null;
};
