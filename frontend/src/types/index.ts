// ===================================================
// CollabFlow Frontend Type Definitions
// ===================================================

// ===== User Types =====
export interface User {
    _id: string;
    name: string;
    email: string;
    avatar?: string | null;
    role: 'user' | 'admin';
    workspaces: string[];
    isEmailVerified: boolean;
    lastActive: Date;
    createdAt: Date;
    updatedAt: Date;
}

// ===== Workspace Types =====
export type WorkspaceRole = 'owner' | 'admin' | 'member' | 'viewer';

export interface WorkspaceMember {
    user: User | string;
    role: WorkspaceRole;
    joinedAt: Date;
}

export interface WorkspaceInvitation {
    _id?: string;
    email: string;
    role: Exclude<WorkspaceRole, 'owner'>;
    invitedBy: User | string;
    token: string;
    expiresAt: Date;
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: Date;
    workspace?: Workspace | string;
    workspaceName?: string;
}

export interface WorkspaceSettings {
    isPublic: boolean;
    allowMemberInvites: boolean;
    defaultProjectVisibility: 'private' | 'workspace' | 'public';
}

export interface Workspace {
    _id: string;
    name: string;
    description: string;
    owner: User | string;
    members: WorkspaceMember[];
    invitations: WorkspaceInvitation[];
    settings: WorkspaceSettings;
    isArchived: boolean;
    userRole?: WorkspaceRole;
    createdAt: Date;
    updatedAt: Date;
}

// ===== Project Types =====
export type ProjectRole = 'owner' | 'editor' | 'viewer';
export type ProjectStatus = 'planning' | 'active' | 'on-hold' | 'completed' | 'archived';
export type ProjectPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ProjectVisibility = 'private' | 'workspace' | 'public';

export interface ProjectMember {
    user: User | string;
    role: ProjectRole;
    addedAt: Date;
}

export interface ProjectSettings {
    allowComments: boolean;
    notifyOnTaskUpdate: boolean;
    enableRealTimeEditing: boolean;
}

export interface Project {
    _id: string;
    name: string;
    description: string;
    workspace: Workspace | string;
    owner: User | string;
    members: ProjectMember[];
    status: ProjectStatus;
    priority: ProjectPriority;
    startDate: Date | null;
    dueDate: Date | null;
    progress: number;
    tags: string[];
    color: string;
    visibility: ProjectVisibility;
    settings: ProjectSettings;
    isArchived: boolean;
    userRole?: ProjectRole;
    createdAt: Date;
    updatedAt: Date;
}

// ===== API Response Types =====
export interface ApiResponse<T = unknown> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}

export interface WorkspacesResponse {
    workspaces: Workspace[];
}

export interface WorkspaceResponse {
    workspace: Workspace;
    userRole: WorkspaceRole;
}

export interface ProjectsResponse {
    projects: Project[];
}

export interface ProjectResponse {
    project: Project;
    userRole?: ProjectRole;
}

export interface MembersResponse {
    members: WorkspaceMember[];
}

export interface InvitationsResponse {
    invitations: WorkspaceInvitation[];
}

// ===== Component Props Types =====
export interface DialogProps {
    open: boolean;
    onClose: () => void;
}

export interface WorkspaceDialogProps extends DialogProps {
    workspaceId?: string;
}

export interface ProjectDialogProps extends DialogProps {
    workspaceId: string;
    project?: Project;
}

// ===== Form Data Types =====
export interface LoginFormData {
    email: string;
    password: string;
}

export interface RegisterFormData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export interface CreateWorkspaceData {
    name: string;
    description?: string;
    settings?: Partial<WorkspaceSettings>;
}

export interface CreateProjectData {
    name: string;
    description?: string;
    status?: ProjectStatus;
    priority?: ProjectPriority;
    startDate?: Date | null;
    dueDate?: Date | null;
    tags?: string[];
    color?: string;
    visibility?: ProjectVisibility;
}

export interface InviteMemberData {
    email: string;
    role: Exclude<WorkspaceRole, 'owner'>;
}

// ===== Store State Types =====
export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    _hasHydrated: boolean;
}

export interface WorkspaceState {
    workspaces: Workspace[];
    currentWorkspace: Workspace | null;
    members: WorkspaceMember[];
    invitations: WorkspaceInvitation[];
}

export interface ProjectState {
    projects: Project[];
    currentProject: Project | null;
}


// ===== Task Types =====
export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface SubTask {
    title: string;
    completed: boolean;
}

export interface Label {
    name: string;
    color: string;
}

export interface Task {
    _id: string;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    assignee?: User | string;
    project: Project | string;
    workspace: Workspace | string;
    dueDate?: Date | null;
    labels: Label[];
    subtasks: SubTask[];
    createdBy: User | string;
    createdAt: Date;
    updatedAt: Date;
}

//task response type
export interface TasksResponse {
    tasks: Task[];
}

export interface TaskResponse {
    task: Task;
}

//task form data types
export interface CreateTaskData {
    title: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    assignee?: string;
    projectId: string;
    dueDate?: Date | null;
    labels?: Label[];
    subtasks?: SubTask[];
}

export interface UpdateTaskData {
    title?: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    assignee?: string;
    dueDate?: Date | null;
    labels?: Label[];
    subtasks?: SubTask[];
}


//task state types
export interface TaskState {
    tasks: Task[];
    projectTasks: Task[];
    currentTask: Task | null;
}


// ===== Chat/Channel Types =====
export type ChannelType = 'public' | 'private' | 'direct';
export type MessageType = 'text' | 'image' | 'file' | 'system';

export interface Channel {
    _id: string;
    name: string;
    description?: string;
    workspace: Workspace | string;
    project?: Project | string;
    type: ChannelType;
    members: (User | string)[];  // Can be populated User objects or just IDs
    createdBy: User | string;
    lastMessage?: Message | string;
    lastActiveAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface Attachment {
    url: string;
    type: string;
    name: string;
    size: number;
}

export interface ReadReceipt {
    user: User | string;
    readAt: Date;
}

export interface Message {
    _id: string;
    channel: Channel | string;
    sender: User | string;
    content: string;
    type: MessageType;
    attachments: Attachment[];
    replyTo?: Message | string;
    mentions: User[] | string[];
    readBy: ReadReceipt[];
    isEdited: boolean;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface TypingUser {
    userId: string;
    user: Pick<User, '_id' | 'name' | 'avatar'>;
}

// ===== Chat API Response Types =====
export interface ChannelsResponse {
    channels: Channel[];
}

export interface ChannelResponse {
    channel: Channel;
}

export interface MessagesResponse {
    messages: Message[];
}

export interface MessageResponse {
    message: Message;
}

// ===== Chat Form Data Types =====
export interface CreateChannelData {
    name: string;
    description?: string;
    type?: ChannelType;
    members?: string[];
    project?: string;
    workspaceId: string;
}

export interface UpdateChannelData {
    name?: string;
    description?: string;
}

export interface CreateMessageData {
    content: string;
    type?: MessageType;
    attachments?: Attachment[];
    replyTo?: string;
    mentions?: string[];
}

export interface UpdateMessageData {
    content: string;
}

// ===== Chat State Types =====
export interface ChatState {
    channels: Channel[];
    activeChannel: Channel | null;
    messages: Record<string, Message[]>; // channelId -> messages
    typingUsers: Record<string, TypingUser[]>; // channelId -> typing users
    unreadCounts: Record<string, number>; // channelId -> count
    isLoading: boolean;
}

// ===== Chat Socket Event Types =====
export interface ChannelJoinEvent {
    channelId: string;
}

export interface MessageSendEvent {
    channelId: string;
    message: Message;
}

export interface MessageEditEvent {
    channelId: string;
    message: Message;
}

export interface MessageDeleteEvent {
    channelId: string;
    messageId: string;
}

export interface TypingEvent {
    channelId: string;
}

export interface MessageReadEvent {
    channelId: string;
    messageIds: string[];
}

export interface MessageSeenEvent {
    userId: string;
    user: Pick<User, '_id' | 'name' | 'avatar'>;
    messageIds: string[];
}
