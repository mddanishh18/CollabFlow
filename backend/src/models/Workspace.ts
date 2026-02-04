import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { IWorkspace, IWorkspaceMember, WorkspaceRole, WORKSPACE_ROLES, WorkspacePermission } from '../types/index.js';
import { resolveObjectId } from '../utils/mongoose.js';

// Constants
const ROLE_PERMISSIONS: Record<WorkspaceRole, WorkspacePermission[]> = {
    owner: ['all'],
    admin: ['invite', 'remove_member', 'edit_workspace', 'delete_project', 'create_project'],
    member: ['create_project', 'edit_own_project'],
    viewer: ['view']
};

// Interface for Workspace Document
// Explicitly type members as subdocument array to avoid repeated type assertions
export interface IWorkspaceDocument extends Omit<IWorkspace, '_id' | 'members'>, Document {
    members: IWorkspaceMember[]; // Strongly typed subdocument array
    createdAt: Date;
    updatedAt: Date;
    projectCount?: number; // Virtual
    isMember(userId: string | Types.ObjectId): boolean;
    getMemberRole(userId: string | Types.ObjectId): WorkspaceRole | null;
    hasPermission(userId: string | Types.ObjectId, permission: WorkspacePermission): boolean;
}

// Interface for Workspace Model with static methods
export interface IWorkspaceModel extends Model<IWorkspaceDocument> {
    getUserWorkspaces(userId: string | Types.ObjectId): Promise<IWorkspaceDocument[]>;
}

const workspaceSchema = new Schema<IWorkspaceDocument, IWorkspaceModel>({
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
            enum: WORKSPACE_ROLES,
            default: 'member'
        },
        joinedAt: {
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

/**
 * Checks if a user is a member of the workspace.
 * Safely handles both populated and unpopulated owner and member IDs.
 */
workspaceSchema.methods.isMember = function (
    this: IWorkspaceDocument,
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
 * Gets the role of a user in the workspace.
 * Returns null if the user is not a member.
 */
workspaceSchema.methods.getMemberRole = function (
    this: IWorkspaceDocument,
    userId: string | Types.ObjectId
): WorkspaceRole | null {
    const userIdStr = userId.toString();
    const ownerId = resolveObjectId(this.owner);
    if (ownerId === userIdStr) return 'owner';

    const member = this.members.find((m) => {
        return resolveObjectId(m.user) === userIdStr;
    });
    return member ? (member.role as WorkspaceRole) : null;
};

/**
 * Checks if a user has a specific permission in the workspace based on their role.
 */
workspaceSchema.methods.hasPermission = function (
    this: IWorkspaceDocument,
    userId: string | Types.ObjectId,
    permission: WorkspacePermission
): boolean {
    const role = this.getMemberRole(userId);
    if (!role) return false;

    return ROLE_PERMISSIONS[role]?.includes(permission) || ROLE_PERMISSIONS[role]?.includes('all');
};

/**
 * Static method to get all workspaces a user belongs to.
 */
workspaceSchema.statics.getUserWorkspaces = async function (
    this: IWorkspaceModel,
    userId: string | Types.ObjectId
): Promise<IWorkspaceDocument[]> {
    return this.find({
        $or: [
            { owner: userId },
            { 'members.user': userId }
        ],
        isArchived: false
    }).sort({ updatedAt: -1 });
};

export default mongoose.model<IWorkspaceDocument, IWorkspaceModel>('Workspace', workspaceSchema);