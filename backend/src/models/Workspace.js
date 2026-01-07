import mongoose from 'mongoose';

const workspaceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Workspace name is required'],
        trim: true,
        minlength: [2, 'Workspace name must be at least 2 characters'],
        maxlength: [100, 'Workspace name cannot exceed 100 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters'],
        default: ''
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        role: {
            type: String,
            enum: ['owner', 'admin', 'member', 'viewer'],
            default: 'member'
        },
        joinedAt: {
            type: Date,
            default: Date.now
        }
    }],
    invitations: [{
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },
        role: {
            type: String,
            enum: ['admin', 'member', 'viewer'],
            default: 'member'
        },
        invitedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        token: {
            type: String,
            required: true
        },
        expiresAt: {
            type: Date,
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected'],
            default: 'pending'
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    settings: {
        isPublic: {
            type: Boolean,
            default: false
        },
        allowMemberInvites: {
            type: Boolean,
            default: false
        },
        defaultProjectVisibility: {
            type: String,
            enum: ['private', 'workspace', 'public'],
            default: 'workspace'
        }
    },
    isArchived: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Indexes
workspaceSchema.index({ owner: 1 });
workspaceSchema.index({ 'members.user': 1 });
workspaceSchema.index({ createdAt: -1 });
workspaceSchema.index({ name: 'text', description: 'text' });

// Virtual for projects count
workspaceSchema.virtual('projectCount', {
    ref: 'Project',
    localField: '_id',
    foreignField: 'workspace',
    count: true
});

// Methods
workspaceSchema.methods.isMember = function (userId) {
    const ownerId = this.owner?._id || this.owner;
    if (ownerId.toString() === userId.toString()) return true;
    return this.members.some(member => {
        const memberId = member.user?._id || member.user;
        return memberId.toString() === userId.toString();
    });
};

workspaceSchema.methods.getMemberRole = function (userId) {
    const ownerId = this.owner?._id || this.owner;
    if (ownerId.toString() === userId.toString()) return 'owner';
    const member = this.members.find(m => {
        const memberId = m.user?._id || m.user;
        return memberId.toString() === userId.toString();
    });
    return member ? member.role : null;
};

workspaceSchema.methods.hasPermission = function (userId, permission) {
    const role = this.getMemberRole(userId);
    if (!role) return false;

    const permissions = {
        owner: ['all'],
        admin: ['invite', 'remove_member', 'edit_workspace', 'delete_project', 'create_project'],
        member: ['create_project', 'edit_own_project'],
        viewer: ['view']
    };

    return permissions[role]?.includes(permission) || permissions[role]?.includes('all');
};

// Statics
workspaceSchema.statics.getUserWorkspaces = async function (userId) {
    return this.find({
        $or: [
            { owner: userId },
            { 'members.user': userId }
        ],
        isArchived: false
    }).sort({ updatedAt: -1 });
};

export default mongoose.model('Workspace', workspaceSchema);
