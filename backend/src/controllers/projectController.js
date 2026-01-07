import Project from "../models/Project.js";
import Workspace from "../models/Workspace.js";

export const createProject = async (req, res) => {
    const { name, description, workspace: workspaceId, status, visibility, priority, startDate, dueDate, tags, color, settings } = req.body;
    const userId = req.user._id;

    try {
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return res.status(404).json({
                success: false,
                message: 'Workspace not found'
            });
        }

        const isMember = workspace.isMember(userId);
        if (!isMember) {
            return res.status(403).json({
                success: false,
                message: 'You must be a workspace member to create projects'
            });
        }

        const userRole = workspace.getMemberRole(userId);
        if (userRole !== 'owner' && userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only workspace owners and admins can create projects'
            });
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

        return res.status(201).json({
            success: true,
            message: 'Project created successfully',
            data: { project }
        });

    } catch (error) {
        console.error('Create project error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create project',
            error: error.message
        });
    }
};


export const getUserProjects = async (req, res) => {
    const userId = req.user._id;

    try {
        const projects = await Project.getUserProjects(userId);

        const projectsWithRole = projects.map(project => ({
            ...project.toObject(),
            userRole: project.getMemberRole(userId),
            canEdit: project.canEdit(userId)
        }));

        return res.status(200).json({
            success: true,
            data: { projects: projectsWithRole }
        });

    } catch (error) {
        console.error('Get user projects error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch projects',
            error: error.message
        });
    }
};


export const getProjectById = async (req, res) => {
    const { projectId } = req.params;
    const userId = req.user._id;

    try {
        const project = await Project.findById(projectId)
            .populate('owner', 'name email avatar')
            .populate('workspace', 'name')
            .populate('members.user', 'name email avatar');

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        const canView = project.canView(userId);
        if (!canView) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        const userRole = project.getMemberRole(userId);
        const canEdit = project.canEdit(userId);

        return res.status(200).json({
            success: true,
            data: {
                project,
                userRole,
                permissions: { canEdit, canView: true }
            }
        });

    } catch (error) {
        console.error('Get project by id error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch project',
            error: error.message
        });
    }
};


export const updateProject = async (req, res) => {
    const { projectId } = req.params;
    const updates = req.body;
    const userId = req.user._id;

    try {
        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        const canEdit = project.canEdit(userId);
        if (!canEdit) {
            return res.status(403).json({
                success: false,
                message: 'Only owners and editors can update projects'
            });
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

        return res.status(200).json({
            success: true,
            data: { project }
        });

    } catch (error) {
        console.error('Update project error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update project',
            error: error.message
        });
    }
};


export const deleteProject = async (req, res) => {
    const { projectId } = req.params;
    const permanent = req.query.permanent === 'true';
    const userId = req.user._id;

    try {
        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        if (project.owner.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Only project owner can delete'
            });
        }

        if (permanent) {
            await project.deleteOne();
            return res.status(200).json({
                success: true,
                message: 'Project deleted permanently'
            });
        } else {
            project.isArchived = true;
            await project.save();
            return res.status(200).json({
                success: true,
                message: 'Project archived successfully'
            });
        }

    } catch (error) {
        console.error('Delete project error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete project',
            error: error.message
        });
    }
};


export const addProjectMember = async (req, res) => {
    const { projectId } = req.params;
    const userId = req.user._id;
    const { userId: memberId, role = 'editor' } = req.body;

    try {
        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        if (project.owner.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Only project owner can add members'
            });
        }

        const validRoles = ['editor', 'viewer'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role'
            });
        }

        const isAlreadyMember = project.isMember(memberId);
        if (isAlreadyMember) {
            return res.status(400).json({
                success: false,
                message: 'User is already a project member'
            });
        }

        const workspace = await Workspace.findById(project.workspace);
        const isWorkspaceMember = workspace.isMember(memberId);

        if (!isWorkspaceMember) {
            return res.status(400).json({
                success: false,
                message: 'User must be a workspace member first'
            });
        }

        project.members.push({
            user: memberId,
            role,
            addedAt: new Date()
        });
        await project.save();

        return res.status(200).json({
            success: true,
            message: 'Member added successfully'
        });

    } catch (error) {
        console.error('Add project member error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to add project member',
            error: error.message
        });
    }
};


export const removeProjectMember = async (req, res) => {
    const { projectId, memberId } = req.params;
    const userId = req.user._id;

    try {
        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        if (project.owner.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Only project owner can remove members'
            });
        }

        if (project.owner.toString() === memberId.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Cannot remove project owner'
            });
        }

        const memberExists = project.members.some(
            m => m.user.toString() === memberId.toString()
        );

        if (!memberExists) {
            return res.status(404).json({
                success: false,
                message: 'Member not found in project'
            });
        }

        project.members = project.members.filter(
            m => m.user.toString() !== memberId.toString()
        );
        await project.save();

        return res.status(200).json({
            success: true,
            message: 'Member removed successfully'
        });


    } catch (error) {
        console.error('Remove project member error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to remove project member',
            error: error.message
        });
    }
};


export const getWorkspaceProjects = async (req, res) => {
    const { workspaceId } = req.params;
    const userId = req.user._id;
    const { status, priority, tags } = req.query;

    try {
        const workspace = await Workspace.findById(workspaceId);

        if (!workspace) {
            return res.status(404).json({
                success: false,
                message: 'Workspace not found'
            });
        }

        const isMember = workspace.isMember(userId);
        if (!isMember) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Check if user is workspace admin or owner
        const workspaceRole = workspace.getMemberRole(userId);
        const isWorkspaceAdmin = workspaceRole === 'owner' || workspaceRole === 'admin';

        const filters = {};
        if (status) filters.status = status;
        if (priority) filters.priority = priority;
        if (tags) filters.tags = tags.split(',');

        const projects = await Project.getWorkspaceProjects(workspaceId, userId, filters, isWorkspaceAdmin);

        const projectsWithRole = projects.map(project => ({
            ...project.toObject(),
            userRole: project.getMemberRole(userId)
        }));

        return res.status(200).json({
            success: true,
            data: { projects: projectsWithRole }
        });

    } catch (error) {
        console.error('Get workspace projects error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch workspace projects',
            error: error.message
        });
    }
};


export const updateProjectMemberRole = async (req, res) => {
    const { projectId, memberId } = req.params;
    const { role: newRole } = req.body;
    const userId = req.user._id;

    try {
        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        if (project.owner.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Only project owner can change member roles'
            });
        }

        if (project.owner.toString() === memberId.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Cannot change owner role'
            });
        }

        const member = project.members.find(
            m => m.user.toString() === memberId.toString()
        );

        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Member not found in project'
            });
        }

        member.role = newRole;
        await project.save();

        return res.status(200).json({
            success: true,
            message: 'Member role updated successfully',
            data: { member }
        });

    } catch (error) {
        console.error('Update project member role error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update member role',
            error: error.message
        });
    }
};


export const leaveProject = async (req, res) => {
    const { projectId } = req.params;
    const userId = req.user._id;

    try {
        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        if (project.owner.toString() === userId.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Owner cannot leave project. Transfer ownership or delete project.'
            });
        }

        const memberIndex = project.members.findIndex(
            m => m.user.toString() === userId.toString()
        );

        if (memberIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'You are not a project member'
            });
        }

        project.members.splice(memberIndex, 1);
        await project.save();

        return res.status(200).json({
            success: true,
            message: 'Successfully left project'
        });

    } catch (error) {
        console.error('Leave project error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to leave project',
            error: error.message
        });
    }
};


export const getProjectMembers = async (req, res) => {
    const { projectId } = req.params;
    const userId = req.user._id;

    try {
        const project = await Project.findById(projectId)
            .populate('owner', 'name email avatar')
            .populate('members.user', 'name email avatar');

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        const canView = project.canView(userId);
        if (!canView) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        const members = [
            {
                user: project.owner,
                role: 'owner',
                addedAt: project.createdAt
            },
            ...project.members
        ];

        return res.status(200).json({
            success: true,
            data: { members }
        });

    } catch (error) {
        console.error('Get project members error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch project members',
            error: error.message
        });
    }
};

