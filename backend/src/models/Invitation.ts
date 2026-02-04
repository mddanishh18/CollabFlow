import mongoose, { Schema, Document, Model } from 'mongoose';
import { IInvitation, InvitationRole, InvitationStatus } from '../types/index.js';

// Interface for Invitation Document (includes Mongoose Document properties)
export interface IInvitationDocument extends IInvitation, Document {
    createdAt: Date;
    updatedAt: Date;
}

// Interface for Invitation Model (includes static methods)
export interface IInvitationModel extends Model<IInvitationDocument> {
    findPendingByEmail(email: string): Promise<IInvitationDocument[]>;
}

const invitationSchema = new Schema<IInvitationDocument, IInvitationModel>({
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true,
        index: true // Key for performance: Fast lookups by email
    },
    workspace: {
        type: Schema.Types.ObjectId,
        ref: 'Workspace',
        required: true
    },
    invitedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'member', 'viewer'],
        default: 'member'
    },
    token: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
    expiresAt: {
        type: Date,
        required: true
    }
}, {
    timestamps: true
});

// Composite index to prevent duplicate pending invites for same user in same workspace
invitationSchema.index({ email: 1, workspace: 1, status: 1 });

/**
 * Static method to find all pending invitations for an email.
 */
invitationSchema.statics.findPendingByEmail = async function (
    this: IInvitationModel,
    email: string
): Promise<IInvitationDocument[]> {
    return this.find({ email: email.toLowerCase(), status: 'pending' })
        .populate('workspace', 'name')
        .populate('invitedBy', 'name email');
};

/**
 * Invitation Model
 * Manages workspace join requests sent via email.
 */
export default mongoose.model<IInvitationDocument, IInvitationModel>('Invitation', invitationSchema);
