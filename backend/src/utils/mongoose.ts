import { Types } from 'mongoose';
import { IUser } from '../types/index.js';

/**
 * Type Guard to check if a Mongoose field is a populated User object.
 */
export const isPopulatedUser = (user: any): user is IUser & { _id: Types.ObjectId } => {
    return typeof user === 'object' && user !== null && 'email' in user;
};

/**
 * Resolves a Mongoose field to its string ID.
 */
export const resolveObjectId = (value: unknown): string => {
    if (!value) return '';

    if (typeof value === 'object' && value !== null && '_id' in value) {
        return (value as { _id: unknown })._id?.toString() || '';
    }

    return String(value);
};