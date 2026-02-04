import { Response } from 'express';
import Workspace, { IWorkspaceDocument } from "../models/Workspace.js";
import Invitation from "../models/Invitation.js";
import { AuthenticatedRequest, WorkspaceRole, WORKSPACE_ROLES, WorkspacePermission, IWorkspaceMember } from '../types/index.js';
import { isPopulatedUser } from '../utils/mongoose.js';

export const createWorkspace = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { name, description, settings } = req.body;
        const userId = req.user._id;

        const workspace = await Workspace.create({
            name: name.trim(),
            description: description || '',
            owner: userId,
            members: [{
                user: userId,
                role: 'owner',
                joinedAt: new Date()
            }],
            settings: {
                isPublic: settings?.isPublic ?? false,
                allowMemberInvites: settings?.allowMemberInvites ?? false,
                defaultProjectVisibility: settings?.defaultProjectVisibility ?? 'workspace'
            }
        });

        await workspace.populate('owner', 'name email');

        res.status(201).json({
            success: true,
            message: 'Workspace created successfully',
            data: { workspace }
        });

    } catch (error) {
        console.error('Create workspace error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create workspace',
            error: (error as Error).message
        });
    }
}


export const getUserWorkspaces = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user._id;

        const workspaces = await Workspace.getUserWorkspaces(userId);

        await Workspace.populate(workspaces, [
            { path: 'owner', select: 'name email avatar' },
            { path: 'members.user', select: 'name email avatar' }
        ]);

        const workspacesWithRole = workspaces.map((workspace: IWorkspaceDocument) => {
            const userRole = workspace.getMemberRole(userId);
            return {
                ...workspace.toObject(),
                userRole
            };
        });

        res.status(200).json({
            success: true,
            message: 'Workspaces fetched successfully',
            data: { workspaces: workspacesWithRole }
        });
    } catch (error) {
        console.error('Get user workspaces error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch workspaces',
            error: (error as Error).message
        });
    }
}


export const getWorkspaceById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const workspaceId = req.params.workspaceId;
    const userId = req.user._id;

    try {
        const workspace = await Workspace.findById(workspaceId)
            .populate('owner', 'name email avatar')
            .populate('members.user', 'name email avatar');

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
                message: 'User is not a member of this workspace'
            });
            return;
        }

        const userRole = workspace.getMemberRole(userId);

        // [OLD VERSION]
        // res.status(200).json({
        //     success: true,
        //     message: 'Workspace fetched successfully',
        //     data: { workspace, userRole }
        // });

        // [NEW VERSION] - Consistent with getUserWorkspaces
        const workspaceWithRole = {
            ...workspace.toObject(),
            userRole
        };

        res.status(200).json({
            success: true,
            message: 'Workspace fetched successfully',
            data: { workspace: workspaceWithRole }
        });

    } catch (error) {
        console.error('Get workspace by id error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch workspace',
            error: (error as Error).message
        });
    }
}


export const updateWorkspace = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const workspaceId = req.params.workspaceId;
    const userId = req.user._id;
    const updates = req.body;

    try {
        const workspace = await Workspace.findById(workspaceId)
            .populate('owner', 'name email avatar')
            .populate('members.user', 'name email avatar');

        if (!workspace) {
            res.status(404).json({
                success: false,
                message: 'Workspace not found'
            });
            return;
        }

        const hasPermission = workspace.hasPermission(userId, 'edit_workspace');
        if (!hasPermission) {
            res.status(403).json({
                success: false,
                message: 'User does not have permission to update this workspace'
            });
            return;
        }

        if (updates.name !== undefined) {
            workspace.name = updates.name;
        }

        if (updates.description !== undefined) {
            workspace.description = updates.description;
        }

        if (updates.settings) {
            workspace.settings = {
                ...workspace.settings,
                ...updates.settings
            };
        }

        await workspace.save();

        res.status(200).json({
            success: true,
            message: 'Workspace updated successfully',
            data: { workspace }
        });

    } catch (error) {
        console.error('Update workspace error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update workspace',
            error: (error as Error).message
        });
    }
}


export const deleteWorkspace = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const workspaceId = req.params.workspaceId;
    const userId = req.user._id;
    const permanent = req.query.permanent === 'true';

    try {
        const workspace = await Workspace.findById(workspaceId);

        if (!workspace) {
            res.status(404).json({
                success: false,
                message: 'Workspace not found'
            });
            return;
        }

        if (workspace.owner.toString() !== userId.toString()) {
            res.status(403).json({
                success: false,
                message: 'Only the workspace owner can delete this workspace'
            });
            return;
        }

        if (permanent) {
            await workspace.deleteOne();
            res.status(200).json({
                success: true,
                message: 'Workspace deleted permanently'
            });
        } else {
            workspace.isArchived = true;
            await workspace.save();
            res.status(200).json({
                success: true,
                message: 'Workspace archived successfully'
            });
        }

    } catch (error) {
        console.error('Delete workspace error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete workspace',
            error: (error as Error).message
        });
    }
}


export const inviteMember = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const workspaceId = req.params.workspaceId;
    const userId = req.user._id;
    const { email, role } = req.body;

    try {
        const workspace = await Workspace.findById(workspaceId)

        if (!workspace) {
            res.status(404).json({
                success: false,
                message: 'Workspace not found'
            });
            return;
        }

        const hasPermission = workspace.hasPermission(userId, 'invite');
        if (!hasPermission) {
            res.status(403).json({
                success: false,
                message: 'User does not have permission to invite members to this workspace'
            });
            return;
        }

        const isAlreadyMember = workspace.members.some(
            (member: IWorkspaceMember) => isPopulatedUser(member.user) && member.user.email === email
        );

        const ownerEmail = isPopulatedUser(workspace.owner) ? workspace.owner.email : '';

        if (isAlreadyMember || ownerEmail === email) {
            res.status(400).json({
                success: false,
                message: 'User is already a member of this workspace'
            });
            return;
        }

        // Check for existing pending invitation in Invitation collection
        const existingInvitation = await Invitation.findOne({
            email,
            workspace: workspaceId,
            status: 'pending',
            expiresAt: { $gt: new Date() }
        });

        if (existingInvitation) {
            res.status(400).json({
                success: false,
                message: 'An invitation has already been sent to this email'
            });
            return;
        }

        const crypto = await import('crypto');
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        // Create new Invitation document
        const invitation = await Invitation.create({
            email,
            role,
            invitedBy: userId,
            workspace: workspaceId,
            token,
            expiresAt,
            status: 'pending'
        });

        const inviteLink = `${process.env.CLIENT_URL}/invite/${token}`;

        res.status(200).json({
            success: true,
            message: 'Invitation sent successfully',
            data: {
                invitation: {
                    email,
                    role,
                    inviteLink,
                    expiresAt
                }
            }
        });

    } catch (error) {
        console.error('Invite member error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to invite member',
            error: (error as Error).message
        });
    }
}


export const acceptInvitation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { token } = req.params;
    const userId = req.user._id;

    try {
        // Find invitation in Invitation collection
        const invitation = await Invitation.findOne({ token });

        if (!invitation) {
            res.status(404).json({
                success: false,
                message: 'Invitation not found'
            });
            return;
        }

        const workspace = await Workspace.findById(invitation.workspace);

        if (!workspace) {
            res.status(404).json({
                success: false,
                message: 'Workspace no longer exists'
            });
            return;
        }

        if (invitation.status !== 'pending') {
            res.status(400).json({
                success: false,
                message: 'Invitation has already been processed'
            });
            return;
        }

        if (new Date() > invitation.expiresAt) {
            res.status(400).json({
                success: false,
                message: 'Invitation has expired'
            });
            return;
        }

        const isMember = workspace.isMember(userId);
        if (isMember) {
            res.status(400).json({
                success: false,
                message: 'You are already a member of this workspace'
            });
            return;
        }

        workspace.members.push({
            user: userId,
            role: invitation.role as WorkspaceRole,
            joinedAt: new Date()
        });

        // Update invitation status
        invitation.status = 'accepted';
        await invitation.save();

        await workspace.save();

        await workspace.populate('owner', 'name email');
        await workspace.populate('members.user', 'name email');

        res.status(200).json({
            success: true,
            message: 'Successfully joined workspace',
            data: { workspace }
        });

    } catch (error) {
        console.error('Accept invitation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to accept invitation',
            error: (error as Error).message
        });
    }
}


export const removeMember = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { workspaceId, memberId } = req.params;
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

        const hasPermission = workspace.hasPermission(userId, 'remove_member');
        if (!hasPermission) {
            res.status(403).json({
                success: false,
                message: 'You do not have permission to remove members'
            });
            return;
        }

        if (workspace.owner.toString() === memberId) {
            res.status(400).json({
                success: false,
                message: 'Cannot remove workspace owner'
            });
            return;
        }

        const member = workspace.members.find((member: IWorkspaceMember) => member.user.toString() === memberId);

        if (!member) {
            res.status(404).json({
                success: false,
                message: 'Member not found'
            });
            return;
        }

        if (memberId === userId.toString()) {
            res.status(400).json({
                success: false,
                message: 'Use the leave endpoint to remove yourself'
            });
            return;
        }

        workspace.members = workspace.members.filter((member: IWorkspaceMember) => member.user.toString() !== memberId);
        await workspace.save();

        res.status(200).json({
            success: true,
            message: 'Member removed successfully'
        });

    } catch (error) {
        console.error('Remove member error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove member',
            error: (error as Error).message
        });
    }
}


export const updateMemberRole = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { workspaceId, memberId } = req.params;
    const userId = req.user._id;
    const { role: newRole } = req.body;

    try {
        const workspace = await Workspace.findById(workspaceId);

        if (!workspace) {
            res.status(404).json({
                success: false,
                message: 'Workspace not found'
            });
            return;
        }

        if (workspace.owner.toString() !== userId.toString()) {
            res.status(403).json({
                success: false,
                message: 'Only the workspace owner can update member roles'
            });
            return;
        }

        if (workspace.owner.toString() === memberId) {
            res.status(404).json({
                success: false,
                message: 'Cannot change owner role'
            });
            return;
        }

        const member = workspace.members.find((m: IWorkspaceMember) => m.user.toString() === memberId);
        if (!member) {
            res.status(404).json({
                success: false,
                message: 'Member not found in workspace'
            });
            return;
        }

        if (!WORKSPACE_ROLES.includes(newRole as WorkspaceRole)) {
            res.status(400).json({
                success: false,
                message: 'Invalid workspace role'
            });
            return;
        }

        member.role = newRole as WorkspaceRole;
        await workspace.save();

        res.status(200).json({
            success: true,
            message: 'Member role updated successfully',
            data: {
                member: {
                    user: member.user,
                    role: member.role
                }
            }
        });

    } catch (error) {
        console.error('Update member role error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update member role',
            error: (error as Error).message
        });
    }
}


export const leaveWorkspace = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { workspaceId } = req.params;
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

        if (workspace.owner.toString() === userId.toString()) {
            res.status(400).json({
                success: false,
                message: 'Owner cannot leave workspace. Transfer ownership or delete workspace.'
            });
            return;
        }

        const memberIndex = workspace.members.findIndex(
            (m: IWorkspaceMember) => m.user.toString() === userId.toString()
        );

        if (memberIndex === -1) {
            res.status(404).json({
                success: false,
                message: 'You are not a member of this workspace'
            });
            return;
        }

        workspace.members.splice(memberIndex, 1);
        await workspace.save();

        res.status(200).json({
            success: true,
            message: 'Successfully left workspace'
        });

    } catch (error) {
        console.error('Leave workspace error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to leave workspace',
            error: (error as Error).message
        });
    }
}


export const getWorkspaceMembers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { workspaceId } = req.params;
    const userId = req.user._id;

    try {
        const workspace = await Workspace.findById(workspaceId)
            .populate('owner', 'name email avatar')
            .populate('members.user', 'name email avatar');

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

        const members = [
            {
                user: workspace.owner,
                role: 'owner' as const,
                joinedAt: (workspace as IWorkspaceDocument).createdAt
            },
            ...workspace.members
        ];

        res.status(200).json({
            success: true,
            data: { members }
        });

    } catch (error) {
        console.error('Get workspace members error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch workspace members',
            error: (error as Error).message
        });
    }
};


export const getWorkspaceInvitations = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { workspaceId } = req.params;
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

        const hasPermission = workspace.hasPermission(userId, 'invite');
        if (!hasPermission) {
            res.status(403).json({
                success: false,
                message: 'No permission to view invitations'
            });
            return;
        }

        const invitations = await Invitation.find({
            workspace: workspaceId,
            status: 'pending',
            expiresAt: { $gt: new Date() }
        }).populate('invitedBy', 'name email');

        res.status(200).json({
            success: true,
            data: { invitations }
        });

    } catch (error) {
        console.error('Get workspace invitations error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch invitations',
            error: (error as Error).message
        });
    }
};


/**
 * Get user's pending invitations across all workspaces
 * GET /api/workspaces/invitations/pending
 */
export const getUserPendingInvitations = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userEmail = req.user.email;

        // Efficient query using separate Invitation model
        const invitations = await Invitation.find({
            email: userEmail,
            status: 'pending'
        })
            .populate('workspace', 'name description owner')
            .populate('invitedBy', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: 'Pending invitations retrieved successfully',
            data: { invitations }
        });

    } catch (error) {
        console.error('Get pending invitations error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve pending invitations',
            error: (error as Error).message
        });
    }
};
