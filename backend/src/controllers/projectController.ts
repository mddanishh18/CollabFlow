import { Response } from 'express';
import Project, { IProjectDocument } from "../models/Project.js";
import Workspace from "../models/Workspace.js";
import { AuthenticatedRequest } from '../types/index.js';

export const createProject = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { name, description, workspace: workspaceId, status, visibility, priority, startDate, dueDate, tags, color, settings } = req.body;
    const userId = req.user._id;

    try {
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            res.status(404).json({
                success: false,
                message: 'Workspace not found'
            });
            return;
        }

        const isMember = workspace.isMember(userId);
        if (!isMember) {
            res.status(403).json({
                success: false,
                message: 'You must be a workspace member to create projects'
            });
            return;
        }

        const userRole = workspace.getMemberRole(userId);
        if (userRole !== 'owner' && userRole !== 'admin') {
            res.status(403).json({
                success: false,
                message: 'Only workspace owners and admins can create projects'
            });
            return;
        }

        const project = await Project.create({
            name: name.trim(),
            description: description || '',
            workspace: workspaceId,
            owner: userId,
            members: [{
                user: userId,
                role: 'owner',
                addedAt: new Date()
            }],
            status: status || 'planning',
            visibility: visibility || 'workspace',
            priority: priority || 'medium',
            startDate: startDate || null,
            dueDate: dueDate || null,
            tags: tags || [],
            color: color || '#3B82F6',
            settings: {
                allowComments: settings?.allowComments ?? true,
                notifyOnTaskUpdate: settings?.notifyOnTaskUpdate ?? true,
                enableRealTimeEditing: settings?.enableRealTimeEditing ?? true
            }
        });

        await project.populate('owner', 'name email avatar');
        await project.populate('workspace', 'name');

        res.status(201).json({
            success: true,
            message: 'Project created successfully',
            data: { project }
        });

    } catch (error) {
        console.error('Create project error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create project',
            error: (error as Error).message
        });
    }
};


export const getUserProjects = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user._id;

    try {
        const projects = await Project.getUserProjects(userId);

        const projectsWithRole = projects.map(project => ({
            ...project.toObject(),
            userRole: project.getMemberRole(userId),
            canEdit: project.canEdit(userId)
        }));

        res.status(200).json({
            success: true,
            data: { projects: projectsWithRole }
        });

    } catch (error) {
        console.error('Get user projects error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch projects',
            error: (error as Error).message
        });
    }
};


export const getProjectById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { projectId } = req.params;
    const userId = req.user._id;

    try {
        const project = await Project.findById(projectId)
            .populate('owner', 'name email avatar')
            .populate('workspace', 'name')
            .populate('members.user', 'name email avatar');

        if (!project) {
            res.status(404).json({
                success: false,
                message: 'Project not found'
            });
            return;
        }

        // Check access: project member OR workspace member (for workspace-visible projects)
        let canView = project.canView(userId);

        // If project has workspace visibility and user is not a project member,
        // check if they are a workspace member
        if (!canView && project.visibility === 'workspace') {
            const workspace = await Workspace.findById(project.workspace);
            if (workspace && workspace.isMember(userId)) {
                canView = true;
            }
        }

        if (!canView) {
            res.status(403).json({
                success: false,
                message: 'Access denied'
            });
            return;
        }

        const userRole = project.getMemberRole(userId);
        const canEdit = project.canEdit(userId);

        res.status(200).json({
            success: true,
            data: {
                project,
                userRole,
                permissions: { canEdit, canView: true }
            }
        });

    } catch (error) {
        console.error('Get project by id error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch project',
            error: (error as Error).message
        });
    }
};


export const updateProject = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { projectId } = req.params;
    const updates = req.body;
    const userId = req.user._id;

    try {
        const project = await Project.findById(projectId);

        if (!project) {
            res.status(404).json({
                success: false,
                message: 'Project not found'
            });
            return;
        }

        const canEdit = project.canEdit(userId);
        if (!canEdit) {
            res.status(403).json({
                success: false,
                message: 'Only owners and editors can update projects'
            });
            return;
        }

        if (updates.name !== undefined) project.name = updates.name;
        if (updates.description !== undefined) project.description = updates.description;
        if (updates.status) project.status = updates.status;
        if (updates.priority) project.priority = updates.priority;
        if (updates.startDate !== undefined) project.startDate = updates.startDate;
        if (updates.dueDate !== undefined) project.dueDate = updates.dueDate;
        if (updates.tags) project.tags = updates.tags;
        if (updates.color) project.color = updates.color;
        if (updates.visibility) project.visibility = updates.visibility;
        if (updates.progress !== undefined) project.progress = updates.progress;
        if (updates.settings) {
            project.settings = { ...project.settings, ...updates.settings };
        }

        await project.save();

        res.status(200).json({
            success: true,
            data: { project }
        });

    } catch (error) {
        console.error('Update project error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update project',
            error: (error as Error).message
        });
    }
};


export const deleteProject = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { projectId } = req.params;
    const permanent = req.query.permanent === 'true';
    const userId = req.user._id;

    try {
        const project = await Project.findById(projectId);

        if (!project) {
            res.status(404).json({
                success: false,
                message: 'Project not found'
            });
            return;
        }

        if (project.owner.toString() !== userId.toString()) {
            res.status(403).json({
                success: false,
                message: 'Only project owner can delete'
            });
            return;
        }

        if (permanent) {
            await project.deleteOne();
            res.status(200).json({
                success: true,
                message: 'Project deleted permanently'
            });
        } else {
            project.isArchived = true;
            await project.save();
            res.status(200).json({
                success: true,
                message: 'Project archived successfully'
            });
        }

    } catch (error) {
        console.error('Delete project error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete project',
            error: (error as Error).message
        });
    }
};


export const addProjectMember = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { projectId } = req.params;
    const userId = req.user._id;
    const { userId: memberId, role = 'editor' } = req.body;

    try {
        const project = await Project.findById(projectId);

        if (!project) {
            res.status(404).json({
                success: false,
                message: 'Project not found'
            });
            return;
        }

        if (project.owner.toString() !== userId.toString()) {
            res.status(403).json({
                success: false,
                message: 'Only project owner can add members'
            });
            return;
        }

        const validRoles = ['editor', 'viewer'];
        if (!validRoles.includes(role)) {
            res.status(400).json({
                success: false,
                message: 'Invalid role'
            });
            return;
        }

        const isAlreadyMember = project.isMember(memberId);
        if (isAlreadyMember) {
            res.status(400).json({
                success: false,
                message: 'User is already a project member'
            });
            return;
        }

        const workspace = await Workspace.findById(project.workspace);
        if (!workspace) {
            res.status(404).json({
                success: false,
                message: 'Workspace not found'
            });
            return;
        }

        const isWorkspaceMember = workspace.isMember(memberId);
        if (!isWorkspaceMember) {
            res.status(400).json({
                success: false,
                message: 'User must be a workspace member first'
            });
            return;
        }

        project.members.push({
            user: memberId,
            role,
            addedAt: new Date()
        });
        await project.save();

        res.status(200).json({
            success: true,
            message: 'Member added successfully'
        });

    } catch (error) {
        console.error('Add project member error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add project member',
            error: (error as Error).message
        });
    }
};


export const removeProjectMember = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { projectId, memberId } = req.params;
    const userId = req.user._id;

    try {
        const project = await Project.findById(projectId);

        if (!project) {
            res.status(404).json({
                success: false,
                message: 'Project not found'
            });
            return;
        }

        if (project.owner.toString() !== userId.toString()) {
            res.status(403).json({
                success: false,
                message: 'Only project owner can remove members'
            });
            return;
        }

        if (project.owner.toString() === memberId.toString()) {
            res.status(400).json({
                success: false,
                message: 'Cannot remove project owner'
            });
            return;
        }

        const memberExists = project.members.some(
            m => m.user.toString() === memberId.toString()
        );

        if (!memberExists) {
            res.status(404).json({
                success: false,
                message: 'Member not found in project'
            });
            return;
        }

        project.members = project.members.filter(
            m => m.user.toString() !== memberId.toString()
        );
        await project.save();

        res.status(200).json({
            success: true,
            message: 'Member removed successfully'
        });


    } catch (error) {
        console.error('Remove project member error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove project member',
            error: (error as Error).message
        });
    }
};


export const getWorkspaceProjects = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { workspaceId } = req.params;
    const userId = req.user._id;
    const { status, priority, tags } = req.query;

    try {
        const workspace = await Workspace.findById(workspaceId);

        if (!workspace) {
            res.status(404).json({
                success: false,
                message: 'Workspace not found'
            });
            return;
        }

        const isMember = workspace.isMember(userId);
        if (!isMember) {
            res.status(403).json({
                success: false,
                message: 'Access denied'
            });
            return;
        }

        // Check if user is workspace admin or owner
        const workspaceRole = workspace.getMemberRole(userId);
        const isWorkspaceAdmin = workspaceRole === 'owner' || workspaceRole === 'admin';

        const filters: Record<string, unknown> = {};
        if (status) filters.status = status;
        if (priority) filters.priority = priority;
        if (tags && typeof tags === 'string') filters.tags = tags.split(',');

        const projects = await Project.getWorkspaceProjects(workspaceId, userId, filters, isWorkspaceAdmin);

        const projectsWithRole = projects.map(project => ({
            ...project.toObject(),
            userRole: project.getMemberRole(userId)
        }));

        res.status(200).json({
            success: true,
            data: { projects: projectsWithRole }
        });

    } catch (error) {
        console.error('Get workspace projects error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch workspace projects',
            error: (error as Error).message
        });
    }
};


export const updateProjectMemberRole = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { projectId, memberId } = req.params;
    const { role: newRole } = req.body;
    const userId = req.user._id;

    try {
        const project = await Project.findById(projectId);

        if (!project) {
            res.status(404).json({
                success: false,
                message: 'Project not found'
            });
            return;
        }

        if (project.owner.toString() !== userId.toString()) {
            res.status(403).json({
                success: false,
                message: 'Only project owner can change member roles'
            });
            return;
        }

        if (project.owner.toString() === memberId.toString()) {
            res.status(400).json({
                success: false,
                message: 'Cannot change owner role'
            });
            return;
        }

        const member = project.members.find(
            m => m.user.toString() === memberId.toString()
        );

        if (!member) {
            res.status(404).json({
                success: false,
                message: 'Member not found in project'
            });
            return;
        }

        member.role = newRole;
        await project.save();

        res.status(200).json({
            success: true,
            message: 'Member role updated successfully',
            data: { member }
        });

    } catch (error) {
        console.error('Update project member role error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update member role',
            error: (error as Error).message
        });
    }
};


export const leaveProject = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { projectId } = req.params;
    const userId = req.user._id;

    try {
        const project = await Project.findById(projectId);

        if (!project) {
            res.status(404).json({
                success: false,
                message: 'Project not found'
            });
            return;
        }

        if (project.owner.toString() === userId.toString()) {
            res.status(400).json({
                success: false,
                message: 'Owner cannot leave project. Transfer ownership or delete project.'
            });
            return;
        }

        const memberIndex = project.members.findIndex(
            m => m.user.toString() === userId.toString()
        );

        if (memberIndex === -1) {
            res.status(404).json({
                success: false,
                message: 'You are not a project member'
            });
            return;
        }

        project.members.splice(memberIndex, 1);
        await project.save();

        res.status(200).json({
            success: true,
            message: 'Successfully left project'
        });

    } catch (error) {
        console.error('Leave project error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to leave project',
            error: (error as Error).message
        });
    }
};


export const getProjectMembers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { projectId } = req.params;
    const userId = req.user._id;

    try {
        const project = await Project.findById(projectId)
            .populate('owner', 'name email avatar')
            .populate('members.user', 'name email avatar');

        if (!project) {
            res.status(404).json({
                success: false,
                message: 'Project not found'
            });
            return;
        }

        // Check access: project member OR workspace member (for workspace-visible projects)
        let canView = project.canView(userId);

        if (!canView && project.visibility === 'workspace') {
            const workspace = await Workspace.findById(project.workspace);
            if (workspace && workspace.isMember(userId)) {
                canView = true;
            }
        }

        if (!canView) {
            res.status(403).json({
                success: false,
                message: 'Access denied'
            });
            return;
        }

        const members = [
            {
                user: project.owner,
                role: 'owner' as const,
                addedAt: (project as IProjectDocument).createdAt
            },
            ...project.members
        ];

        res.status(200).json({
            success: true,
            data: { members }
        });

    } catch (error) {
        console.error('Get project members error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch project members',
            error: (error as Error).message
        });
    }
};
