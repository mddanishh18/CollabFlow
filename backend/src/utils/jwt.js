import jwt from 'jsonwebtoken';
import env from '../config/env.js';

/**
 * Generate JWT token
 * @param {Object} payload - Data to encode in token (usually user id)
 * @returns {String} JWT token
 */
export const generateToken = (payload) => {
    return jwt.sign(payload, env.JWT_SECRET, {
        expiresIn: env.JWT_EXPIRES_IN
    });
};

/**
 * Verify JWT token
 * @param {String} token - JWT token to verify
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
export const verifyToken = (token) => {
    try {
        return jwt.verify(token, env.JWT_SECRET);
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new Error('Token has expired');
        }
        if (error.name === 'JsonWebTokenError') {
            throw new Error('Invalid token');
        }
        throw error;
    }
};

/**
 * Generate access token for user
 * @param {Object} user - User object
 * @returns {String} JWT token
 */
export const generateAccessToken = (user) => {
    return generateToken({
        userId: user._id,
        email: user.email,
        role: user.role
    });
};

/**
 * Decode token without verification (useful for debugging)
 * @param {String} token - JWT token
 * @returns {Object} Decoded token
 */
export const decodeToken = (token) => {
    return jwt.decode(token);
};
