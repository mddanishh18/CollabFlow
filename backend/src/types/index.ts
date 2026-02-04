// ===================================================
// CollabFlow Backend Type Definitions
// Using Mongoose HydratedDocument Pattern (2025 Best Practice)
// ===================================================

import { Request } from 'express';
import { Types, HydratedDocument, Model } from 'mongoose';

// ===== Extended Express Request =====
export interface AuthenticatedRequest extends Request {
    user: {
        _id: Types.ObjectId;
        email: string;
        name: string;
    };
}

// ===== User Types =====

// User - Raw Data Interface (pure data shape, no mongoose methods)
export interface IUser {
    name: string;
    email: string;
    password: string;
    avatar?: string | null;
    role: 'user' | 'admin';
    workspaces: Types.ObjectId[];
    isEmailVerified: boolean;
    lastActive: Date;
}


// ===== Workspace Types =====

export type WorkspaceRole = 'owner' | 'admin' | 'member' | 'viewer';
export const WORKSPACE_ROLES: WorkspaceRole[] = ['owner', 'admin', 'member', 'viewer'];

export type WorkspacePermission =
    | 'all'
    | 'invite'
    | 'remove_member'
    | 'edit_workspace'
    | 'delete_project'
    | 'create_project'
    | 'edit_own_project'
    | 'view';

export interface IWorkspaceMember {
    user: Types.ObjectId | IUser;
    role: WorkspaceRole;
    joinedAt: Date;
}

export interface IWorkspaceInvitation {
    email: string;
    role: Exclude<WorkspaceRole, 'owner'>;
    invitedBy: Types.ObjectId;
    token: string;
    expiresAt: Date;
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: Date;
}

export interface IWorkspaceSettings {
    isPublic: boolean;
    allowMemberInvites: boolean;
    defaultProjectVisibility: 'private' | 'workspace' | 'public';
}

// Workspace - Raw Data Interface
export interface IWorkspace {
    name: string;
    description: string;
    owner: Types.ObjectId | IUser;
    members: IWorkspaceMember[];

    settings: IWorkspaceSettings;
    isArchived: boolean;
}

// Workspace Methods Interface
export interface IWorkspaceMethods {
    isMember(userId: Types.ObjectId | string): boolean;
    getMemberRole(userId: Types.ObjectId | string): WorkspaceRole | null;
    hasPermission(userId: Types.ObjectId | string, permission: string): boolean;
}



// ===== Project Types =====

export type ProjectRole = 'owner' | 'editor' | 'viewer';
export type ProjectStatus = 'planning' | 'active' | 'on-hold' | 'completed' | 'archived';
export type ProjectPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ProjectVisibility = 'private' | 'workspace' | 'public';

export interface IProjectMember {
    user: Types.ObjectId | IUser;
    role: ProjectRole;
    addedAt: Date;
}

export interface IProjectSettings {
    allowComments: boolean;
    notifyOnTaskUpdate: boolean;
    enableRealTimeEditing: boolean;
}

// Project - Raw Data Interface
export interface IProject {
    name: string;
    description: string;
    workspace: Types.ObjectId | IWorkspace;
    owner: Types.ObjectId | IUser;
    members: IProjectMember[];
    status: ProjectStatus;
    priority: ProjectPriority;
    startDate: Date | null;
    dueDate: Date | null;
    progress: number;
    tags: string[];
    color: string;
    visibility: ProjectVisibility;
    settings: IProjectSettings;
    isArchived: boolean;
    archivedAt: Date | null;
}

// Project Methods Interface
export interface IProjectMethods {
    isMember(userId: Types.ObjectId | string): boolean;
    getMemberRole(userId: Types.ObjectId | string): ProjectRole | null;
    canEdit(userId: Types.ObjectId | string): boolean;
    canView(userId: Types.ObjectId | string): boolean;
}



// ===== JWT Types =====

export interface JwtPayload {
    userId: string;
    email: string;
    name: string;
    iat?: number;
    exp?: number;
}

// ===== API Response Types =====

export interface ApiResponse<T = unknown> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
}

// ===== Controller Types =====

export interface PaginationQuery {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
}

export interface WorkspaceQuery extends PaginationQuery {
    archived?: boolean;
}

export interface ProjectQuery extends PaginationQuery {
    status?: ProjectStatus;
    priority?: ProjectPriority;
    archived?: boolean;
}


// ===== Task Types =====
export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface ISubtask {
    title: string;
    completed: boolean;
}

export interface ILabel {
    name: string;
    color: string;
}

export interface ITask {
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    assignee?: Types.ObjectId | IUser;
    project: Types.ObjectId | IProject;
    workspace: Types.ObjectId | IWorkspace;
    dueDate: Date | null;
    subtasks: ISubtask[];
    labels: ILabel[];
    createdBy: Types.ObjectId | IUser;
}

// ===== Chat Types =====

export type ChannelType = 'public' | 'private' | 'direct';
export type MessageType = 'text' | 'image' | 'file' | 'system';

export interface IAttachment {
    url: string;
    type: string;
    name: string;
    size: number;
}

export interface IReadReceipt {
    user: Types.ObjectId | IUser;
    readAt: Date;
}

// Channel - Raw Data Interface
export interface IChannel {
    name: string;
    description?: string;
    workspace: Types.ObjectId | IWorkspace; // Link to workspace
    project?: Types.ObjectId | IProject;    // Optional link to project
    type: ChannelType;
    members: Types.ObjectId[] | IUser[];    // For private/direct channels
    createdBy: Types.ObjectId | IUser;
    lastMessage?: Types.ObjectId | IMessage; // For optimization
    lastActiveAt: Date;
}

// Channel Methods Interface
export interface IChannelMethods {
    isMember(userId: Types.ObjectId | string): boolean;
    addMember(userId: Types.ObjectId | string): Promise<void>;
    removeMember(userId: Types.ObjectId | string): Promise<void>;
}

// Message - Raw Data Interface
export interface IMessage {
    channel: Types.ObjectId | IChannel;
    sender: Types.ObjectId | IUser;
    content: string;
    type: MessageType;
    attachments: IAttachment[];
    replyTo?: Types.ObjectId | IMessage; // For threads
    mentions: Types.ObjectId[] | IUser[];
    readBy: IReadReceipt[];
    isEdited: boolean;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// Message Methods Interface
export interface IMessageMethods {
    markAsRead(userId: Types.ObjectId | string): Promise<void>;
    softDelete(): Promise<void>;
}

// ===== Invitation Types =====

export type InvitationRole = 'admin' | 'member' | 'viewer';
export type InvitationStatus = 'pending' | 'accepted' | 'rejected';

export interface IInvitation {
    email: string;
    workspace: Types.ObjectId;
    invitedBy: Types.ObjectId;
    role: InvitationRole;
    token: string;
    status: InvitationStatus;
    expiresAt: Date;
}