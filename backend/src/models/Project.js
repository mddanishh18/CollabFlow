import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Project name is required'],
        trim: true,
        minlength: [2, 'Project name must be at least 2 characters'],
        maxlength: [100, 'Project name cannot exceed 100 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [1000, 'Description cannot exceed 1000 characters'],
        default: ''
    },
    workspace: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workspace',
        required: true
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
            enum: ['owner', 'editor', 'viewer'],
            default: 'editor'
        },
        addedAt: {
            type: Date,
            default: Date.now
        }
    }],
    status: {
        type: String,
        enum: ['planning', 'active', 'on-hold', 'completed', 'archived'],
        default: 'planning'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    startDate: {
        type: Date,
        default: null
    },
    dueDate: {
        type: Date,
        default: null
    },
    progress: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    tags: [{
        type: String,
        trim: true,
        maxlength: 30
    }],
    color: {
        type: String,
        default: '#3B82F6', // Blue
        match: /^#[0-9A-F]{6}$/i
    },
    visibility: {
        type: String,
        enum: ['private', 'workspace', 'public'],
        default: 'workspace'
    },
    settings: {
        allowComments: {
            type: Boolean,
            default: true
        },
        notifyOnTaskUpdate: {
            type: Boolean,
            default: true
        },
        enableRealTimeEditing: {
            type: Boolean,
            default: true
        }
    },
    isArchived: {
        type: Boolean,
        default: false
    },
    archivedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Indexes
projectSchema.index({ workspace: 1, createdAt: -1 });
projectSchema.index({ owner: 1 });
projectSchema.index({ 'members.user': 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ priority: 1 });
projectSchema.index({ name: 'text', description: 'text' });
projectSchema.index({ tags: 1 });

// Virtual for tasks count
projectSchema.virtual('taskCount', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'project',
    count: true
});

// Methods
projectSchema.methods.isMember = function (userId) {
    const ownerId = this.owner?._id || this.owner;
    if (ownerId.toString() === userId.toString()) return true;
    return this.members.some(member => {
        const memberId = member.user?._id || member.user;
        return memberId.toString() === userId.toString();
    });
};

projectSchema.methods.getMemberRole = function (userId) {
    const ownerId = this.owner?._id || this.owner;
    if (ownerId.toString() === userId.toString()) return 'owner';
    const member = this.members.find(m => {
        const memberId = m.user?._id || m.user;
        return memberId.toString() === userId.toString();
    });
    return member ? member.role : null;
};

projectSchema.methods.canEdit = function (userId) {
    const role = this.getMemberRole(userId);
    return role === 'owner' || role === 'editor';
};

projectSchema.methods.canView = function (userId) {
    if (this.visibility === 'public') return true;
    if (this.visibility === 'private') {
        return this.isMember(userId);
    }
    // workspace visibility - check in controller
    return this.isMember(userId);
};

projectSchema.methods.updateProgress = async function () {
    // This will be populated when Task model is created
    // For now, manual progress updates
    return this.progress;
};

// Pre-save middleware
projectSchema.pre('save', function (next) {
    if (this.isModified('isArchived') && this.isArchived) {
        this.archivedAt = new Date();
    }
    next();
});

// Statics
projectSchema.statics.getWorkspaceProjects = async function (workspaceId, userId, filters = {}, isWorkspaceAdmin = false) {
    const baseQuery = { workspace: workspaceId, isArchived: false };

    if (filters.status) baseQuery.status = filters.status;
    if (filters.priority) baseQuery.priority = filters.priority;
    if (filters.tags && filters.tags.length > 0) baseQuery.tags = { $in: filters.tags };

    // Workspace owners/admins can see all projects
    if (isWorkspaceAdmin) {
        return this.find(baseQuery)
            .populate('owner', 'name email')
            .populate('members.user', 'name email')
            .sort({ updatedAt: -1 });
    }

    // Regular members only see:
    // 1. Projects they own
    // 2. Projects they're a member of
    // 3. Projects with 'workspace' visibility (visible to all workspace members)
    const query = {
        ...baseQuery,
        $or: [
            { owner: userId },
            { 'members.user': userId },
            { visibility: 'workspace' }
        ]
    };

    return this.find(query)
        .populate('owner', 'name email')
        .populate('members.user', 'name email')
        .sort({ updatedAt: -1 });
};

projectSchema.statics.getUserProjects = async function (userId) {
    return this.find({
        $or: [
            { owner: userId },
            { 'members.user': userId }
        ],
        isArchived: false
    }).populate('workspace', 'name').sort({ updatedAt: -1 });
};

export default mongoose.model('Project', projectSchema);
