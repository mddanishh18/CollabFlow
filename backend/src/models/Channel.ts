import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { IChannel, IChannelMethods, ChannelType, IUser } from '../types/index.js';
import { resolveObjectId } from '../utils/mongoose.js';

// Interface combining Data + Methods + Mongoose Document
// Explicitly type members to avoid repeated type assertions
export interface IChannelDocument extends Omit<IChannel, 'members'>, Document {
    members: Types.ObjectId[]; // Array of ObjectIds (unpopulated)
    isMember(userId: string | Types.ObjectId): boolean;
    addMember(userId: string | Types.ObjectId): Promise<void>;
    removeMember(userId: string | Types.ObjectId): Promise<void>;
}

export interface IChannelModel extends Model<IChannelDocument> {
    getWorkspaceChannels(workspaceId: string | Types.ObjectId, userId: string | Types.ObjectId): Promise<IChannelDocument[]>;
    findDirectMessage(workspaceId: string | Types.ObjectId, userA: string | Types.ObjectId, userB: string | Types.ObjectId): Promise<IChannelDocument | null>;
}

const channelSchema = new Schema<IChannelDocument, IChannelModel>({
    name: {
        type: String,
        required: [true, 'Channel name is required'],
        trim: true,
        minlength: [2, 'Channel name must be at least 2 characters'],
        maxlength: [50, 'Channel name cannot exceed 50 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [200, 'Description cannot exceed 200 characters']
    },
    workspace: {
        type: Schema.Types.ObjectId,
        ref: 'Workspace',
        required: true,
        index: true
    },
    project: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        index: true
    },
    type: {
        type: String,
        enum: ['public', 'private', 'direct'],
        default: 'public'
    },
    members: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    lastMessage: {
        type: Schema.Types.ObjectId,
        ref: 'Message'
    },
    lastActiveAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Validation: Direct messages must have exactly 2 members (1-on-1 only)
channelSchema.pre('validate', function(next) {
    if (this.type === 'direct' && this.members.length !== 2) {
        return next(new Error('Direct messages must have exactly 2 members for 1-on-1 conversations'));
    }
    next();
});

// Indexes
channelSchema.index({ workspace: 1, type: 1 });
channelSchema.index({ members: 1 });

// Methods
/**
 * Checks if a user is a member of the channel.
 * Safely handles both populated and unpopulated member IDs.
 */
channelSchema.methods.isMember = function (
    this: IChannelDocument,
    userId: string | Types.ObjectId
): boolean {
    const userIdStr = userId.toString();
    return this.members.some((m) => {
        return resolveObjectId(m) === userIdStr;
    });
};

/**
 * Adds a user to the channel members if they are not already a member.
 */
channelSchema.methods.addMember = async function (
    this: IChannelDocument,
    userId: string | Types.ObjectId
): Promise<void> {
    if (!this.isMember(userId)) {
        this.members.push(new Types.ObjectId(userId));
        await this.save();
    }
};

/**
 * Removes a user from the channel members.
 * Safely handles both populated and unpopulated member IDs.
 */
channelSchema.methods.removeMember = async function (
    this: IChannelDocument,
    userId: string | Types.ObjectId
): Promise<void> {
    const userIdStr = userId.toString();
    const filteredMembers = this.members.filter((m) => resolveObjectId(m) !== userIdStr);
    this.members = filteredMembers as typeof this.members;
    await this.save();
};

// Statics
channelSchema.statics.getWorkspaceChannels = async function (
    this: IChannelModel,
    workspaceId: string | Types.ObjectId,
    userId: string | Types.ObjectId
): Promise<IChannelDocument[]> {
    const channels = await this.find({
        workspace: workspaceId,
        $or: [
            { type: 'public' },
            { members: userId }
        ]
    })
    .populate('members', 'name email avatar') // Populate member details
    .populate('createdBy', 'name email')
    .sort({ lastActiveAt: -1 })
    .exec();
    
    return channels;
};

channelSchema.statics.findDirectMessage = async function (
    this: IChannelModel,
    workspaceId: string | Types.ObjectId,
    userA: string | Types.ObjectId,
    userB: string | Types.ObjectId
): Promise<IChannelDocument | null> {
    return this.findOne({
        workspace: workspaceId,
        type: 'direct',
        members: { $all: [userA, userB] }
    });
};

export default mongoose.model<IChannelDocument, IChannelModel>('Channel', channelSchema);