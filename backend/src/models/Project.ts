import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { IProject, IProjectMember, ProjectRole } from '../types/index.js';
import { resolveObjectId } from '../utils/mongoose.js';

// Interface for Project Document
// Explicitly type members as subdocument array to avoid repeated type assertions
export interface IProjectDocument extends Omit<IProject, '_id' | 'members'>, Document {
    members: IProjectMember[]; // Strongly typed subdocument array
    createdAt: Date;
    updatedAt: Date;
    taskCount?: number; // Virtual
    isMember(userId: string | Types.ObjectId): boolean;
    getMemberRole(userId: string | Types.ObjectId): ProjectRole | null;
    canEdit(userId: string | Types.ObjectId): boolean;
    canView(userId: string | Types.ObjectId): boolean;
    updateProgress(): Promise<number>;
}

// Interface for Project Model with static methods
export interface IProjectModel extends Model<IProjectDocument> {
    getWorkspaceProjects(
        workspaceId: string | Types.ObjectId,
        userId: string | Types.ObjectId,
        filters?: Record<string, any>,
        isWorkspaceAdmin?: boolean
    ): Promise<IProjectDocument[]>;
    getUserProjects(userId: string | Types.ObjectId): Promise<IProjectDocument[]>;
}

const projectSchema = new Schema<IProjectDocument, IProjectModel>({
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
        type: Schema.Types.ObjectId,
        ref: 'Workspace',
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [{
        user: {
            type: Schema.Types.ObjectId,
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
/**
 * Checks if a user is a member of the project.
 * Safely handles both populated and unpopulated IDs.
 */
projectSchema.methods.isMember = function (
    this: IProjectDocument,
    userId: string | Types.ObjectId
): boolean {
    const userIdStr = userId.toString();
    const ownerId = resolveObjectId(this.owner);
    if (ownerId === userIdStr) return true;
    return this.members.some((member) => {
        return resolveObjectId(member.user) === userIdStr;
    });
};

/**
 * Gets the role of a user in the project.
 */
projectSchema.methods.getMemberRole = function (
    this: IProjectDocument,
    userId: string | Types.ObjectId
): ProjectRole | null {
    const userIdStr = userId.toString();
    const ownerId = resolveObjectId(this.owner);
    if (ownerId === userIdStr) return 'owner';
    const member = this.members.find((m) => {
        return resolveObjectId(m.user) === userIdStr;
    });
    return member ? (member.role as ProjectRole) : null;
};

/**
 * Checks if a user has editor permissions.
 */
projectSchema.methods.canEdit = function (
    this: IProjectDocument,
    userId: string | Types.ObjectId
): boolean {
    const role = this.getMemberRole(userId);
    return role === 'owner' || role === 'editor';
};

/**
 * Checks if a user has view permissions.
 * Public projects are visible to all.
 */
projectSchema.methods.canView = function (
    this: IProjectDocument,
    userId: string | Types.ObjectId
): boolean {
    if (this.visibility === 'public') return true;
    if (this.visibility === 'private') {
        return this.isMember(userId);
    }
    // workspace visibility - check in controller
    return this.isMember(userId);
};

projectSchema.methods.updateProgress = async function (this: IProjectDocument): Promise<number> {
    // This will be populated when Task model is created
    // For now, manual progress updates
    return this.progress;
};

// Pre-save middleware
projectSchema.pre('save', function (this: IProjectDocument, next) {
    if (this.isModified('isArchived') && this.isArchived) {
        this.archivedAt = new Date();
    }
    next();
});

// Statics
projectSchema.statics.getWorkspaceProjects = async function (
    this: IProjectModel,
    workspaceId: string | Types.ObjectId,
    userId: string | Types.ObjectId,
    filters: Record<string, any> = {},
    isWorkspaceAdmin: boolean = false
): Promise<IProjectDocument[]> {
    const baseQuery: Record<string, any> = { workspace: workspaceId, isArchived: false };

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

projectSchema.statics.getUserProjects = async function (
    this: IProjectModel,
    userId: string | Types.ObjectId
): Promise<IProjectDocument[]> {
    return this.find({
        $or: [
            { owner: userId },
            { 'members.user': userId }
        ],
        isArchived: false
    }).populate('workspace', 'name').sort({ updatedAt: -1 });
};

export default mongoose.model<IProjectDocument, IProjectModel>('Project', projectSchema);
