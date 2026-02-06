import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { IMessage, IMessageMethods, MessageType, IReadReceipt, IUser } from '../types/index.js';
import { resolveObjectId } from '../utils/mongoose.js';

export interface IMessageDocument extends IMessage, IMessageMethods, Document { }

export interface IMessageModel extends Model<IMessageDocument> {
    getChannelMessages(channelId: string | Types.ObjectId, limit?: number, beforeId?: string): Promise<IMessageDocument[]>;
}

const messageSchema = new Schema<IMessageDocument, IMessageModel>({
    channel: {
        type: Schema.Types.ObjectId,
        ref: 'Channel',
        required: true,
        index: true
    },
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        trim: true
    },
    type: {
        type: String,
        enum: ['text', 'image', 'file', 'system'],
        default: 'text'
    },
    attachments: [{
        url: String,
        type: String,
        name: String,
        size: Number
    }],
    replyTo: {
        type: Schema.Types.ObjectId,
        ref: 'Message'
    },
    mentions: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    readBy: [{
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        readAt: { type: Date, default: Date.now }
    }],
    isEdited: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Indexes
messageSchema.index({ channel: 1, createdAt: -1 });

/**
 * Marks a message as read by a user.
 * Safely handles both populated and unpopulated user IDs in read receipts.
 */
messageSchema.methods.markAsRead = async function (
    this: IMessageDocument,
    userId: string | Types.ObjectId
): Promise<void> {
    const userIdStr = userId.toString();
    const userObjectId = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
    
    const hasRead = this.readBy.some((r: IReadReceipt) => {
        return resolveObjectId(r.user) === userIdStr;
    });

    if (!hasRead) {
        this.readBy.push({ user: userObjectId, readAt: new Date() });
        await this.save();
    }
};

/**
 * Performs a soft delete on a message.
 * Replaces content and clears attachments instead of removing the document.
 */
messageSchema.methods.softDelete = async function (
    this: IMessageDocument
): Promise<void> {
    this.isDeleted = true;
    this.content = 'This message was deleted';
    this.attachments = [];
    await this.save();
};

// Statics
messageSchema.statics.getChannelMessages = async function (
    this: IMessageModel,
    channelId: string | Types.ObjectId,
    limit: number = 50,
    beforeId?: string
): Promise<IMessageDocument[]> {
    const query: any = { channel: channelId };

    if (beforeId) {
        query._id = { $lt: beforeId };
    }

    return this.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('sender', 'name avatar')
        .populate('replyTo')
        .populate('mentions', 'name')
        .populate('readBy.user', 'name email avatar')
        .exec();
};

export default mongoose.model<IMessageDocument, IMessageModel>('Message', messageSchema);
