import Workspace from "../models/Workspace.js";

export const createWorkspace = async (req, res) => {
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

        return res.status(201).json({
            success: true,
            message: 'Workspace created successfully',
            data: { workspace }
        });

    } catch (error) {
        console.error('Create workspace error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create workspace',
            error: error.message
        });
    }
}


export const getUserWorkspaces = async (req, res) => {
    try {
        const userId = req.user._id;

        const workspaces = await Workspace.getUserWorkspaces(userId);

        await Workspace.populate(workspaces, [
            { path: 'owner', select: 'name email avatar' },
            { path: 'members.user', select: 'name email avatar' }
        ]);

        const workspacesWithRole = workspaces.map(workspace => {
            const userRole = workspace.getMemberRole(userId);
            return {
                ...workspace.toObject(),
                userRole
            };
        });

        return res.status(200).json({
            success: true,
            message: 'Workspaces fetched successfully',
            data: { workspaces: workspacesWithRole }
        });
    } catch (error) {
        console.error('Get user workspaces error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch workspaces',
            error: error.message
        });
    }
}


export const getWorkspaceById = async (req, res) => {
    const workspaceId = req.params.workspaceId;
    const userId = req.user._id;

    try {
        const workspace = await Workspace.findById(workspaceId)
            .populate('owner', 'name email avatar')
            .populate('members.user', 'name email avatar');

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
                message: 'User is not a member of this workspace'
            });
        }

        const userRole = workspace.getMemberRole(userId);

        return res.status(200).json({
            success: true,
            message: 'Workspace fetched successfully',
            data: { workspace, userRole }
        });

    } catch (error) {
        console.error('Get workspace by id error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch workspace',
            error: error.message
        });
    }
}


export const updateWorkspace = async (req, res) => {
    const workspaceId = req.params.workspaceId;
    const userId = req.user._id;
    const updates = req.body;

    try {
        const workspace = await Workspace.findById(workspaceId)
            .populate('owner', 'name email avatar')
            .populate('members.user', 'name email avatar');

        if (!workspace) {
            return res.status(404).json({
                success: false,
                message: 'Workspace not found'
            });
        }

        const hasPermission = workspace.hasPermission(userId, 'edit_workspace');
        if (!hasPermission) {
            return res.status(403).json({
                success: false,
                message: 'User does not have permission to update this workspace'
            });
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

        return res.status(200).json({
            success: true,
            message: 'Workspace updated successfully',
            data: { workspace }
        });

    } catch (error) {
        console.error('Update workspace error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update workspace',
            error: error.message
        });
    }
}


export const deleteWorkspace = async (req, res) => {
    const workspaceId = req.params.workspaceId;
    const userId = req.user._id;
    const permanent = req.query.permanent === 'true';

    try {
        const workspace = await Workspace.findById(workspaceId);

        if (!workspace) {
            return res.status(404).json({
                success: false,
                message: 'Workspace not found'
            });
        }

        if (workspace.owner.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Only the workspace owner can delete this workspace'
            });
        }

        if (permanent) {
            await workspace.deleteOne();
            return res.status(200).json({
                success: true,
                message: 'Workspace deleted permanently'
            });
        } else {
            workspace.isArchived = true;
            await workspace.save();
            return res.status(200).json({
                success: true,
                message: 'Workspace archived successfully'
            });
        }

    } catch (error) {
        console.error('Delete workspace error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete workspace',
            error: error.message
        });
    }
}


export const inviteMember = async (req, res) => {
    const workspaceId = req.params.workspaceId;
    const userId = req.user._id;
    const { email, role } = req.body;

    try {
        const workspace = await Workspace.findById(workspaceId)

        if (!workspace) {
            return res.status(404).json({
                success: false,
                message: 'Workspace not found'
            });
        }

        const hasPermission = workspace.hasPermission(userId, 'invite');
        if (!hasPermission) {
            return res.status(403).json({
                success: false,
                message: 'User does not have permission to invite members to this workspace'
            });
        }

        const isAlreadyMember = workspace.members.some(
            member => member.user.email === email
        );
        if (isAlreadyMember || workspace.owner.email === email) {
            return res.status(400).json({
                success: false,
                message: 'User is already a member of this workspace'
            });
        }

        const existingInvitation = workspace.invitations.find(
            inv => inv.email === email && inv.status === 'pending' && new Date(inv.expiresAt) > new Date()
        );
        if (existingInvitation) {
            return res.status(400).json({
                success: false,
                message: 'An invitation has already been sent to this email'
            });
        }

        const crypto = await import('crypto');
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        const invitation = {
            email,
            role,
            invitedBy: userId,
            token,
            expiresAt,
            status: 'pending',
            createdAt: new Date()
        };

        workspace.invitations.push(invitation);
        await workspace.save();

        const inviteLink = `${process.env.CLIENT_URL}/invite/${token}`;

        return res.status(200).json({
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
        return res.status(500).json({
            success: false,
            message: 'Failed to invite member',
            error: error.message
        });
    }
}


export const acceptInvitation = async (req, res) => {
    const { token } = req.params;
    const userId = req.user._id;

    try {
        const workspace = await Workspace.findOne({
            'invitations.token': token
        });

        if (!workspace) {
            return res.status(404).json({
                success: false,
                message: 'Invitation not found'
            });
        }

        const invitation = workspace.invitations.find(i => i.token === token);

        if (invitation.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Invitation has already been processed'
            });
        }

        if (new Date() > invitation.expiresAt) {
            return res.status(400).json({
                success: false,
                message: 'Invitation has expired'
            });
        }

        const isMember = workspace.isMember(userId);
        if (isMember) {
            return res.status(400).json({
                success: false,
                message: 'You are already a member of this workspace'
            });
        }

        workspace.members.push({
            user: userId,
            role: invitation.role,
            joinedAt: new Date()
        });

        invitation.status = 'accepted';
        await workspace.save();

        await workspace.populate('owner', 'name email');
        await workspace.populate('members.user', 'name email');

        return res.status(200).json({
            success: true,
            message: 'Successfully joined workspace',
            data: { workspace }
        });

    } catch (error) {
        console.error('Accept invitation error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to accept invitation',
            error: error.message
        });
    }
}


export const removeMember = async (req, res) => {
    const { workspaceId, memberId } = req.params;
    const userId = req.user._id;

    try {
        const workspace = await Workspace.findById(workspaceId);

        if (!workspace) {
            return res.status(404).json({
                success: false,
                message: 'Workspace not found'
            });
        }

        const hasPermission = workspace.hasPermission(userId, 'remove_member');
        if (!hasPermission) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to remove members'
            });
        }

        if (workspace.owner.toString() === memberId) {
            return res.status(400).json({
                success: false,
                message: 'Cannot remove workspace owner'
            });
        }

        const member = workspace.members.find(member => member.user.toString() === memberId);

        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Member not found'
            });
        }

        if (memberId === userId.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Use the leave endpoint to remove yourself'
            });
        }

        workspace.members = workspace.members.filter(member => member.user.toString() !== memberId);
        await workspace.save();

        return res.status(200).json({
            success: true,
            message: 'Member removed successfully'
        });

    } catch (error) {
        console.error('Remove member error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to remove member',
            error: error.message
        });
    }
}


export const updateMemberRole = async (req, res) => {
    const { workspaceId, memberId } = req.params;
    const userId = req.user._id;
    const { role: newRole } = req.body;

    try {
        const workspace = await Workspace.findById(workspaceId);

        if (!workspace) {
            return res.status(404).json({
                success: false,
                message: 'Workspace not found'
            });
        }

        if (workspace.owner.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Only the workspace owner can update member roles'
            });
        }

        if (workspace.owner.toString() === memberId) {
            return res.status(400).json({
                success: false,
                message: 'Cannot change owner role'
            });
        }

        const member = workspace.members.find(m => m.user.toString() === memberId);
        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Member not found in workspace'
            });
        }

        member.role = newRole;
        await workspace.save();

        return res.status(200).json({
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
        return res.status(500).json({
            success: false,
            message: 'Failed to update member role',
            error: error.message
        });
    }
}


export const leaveWorkspace = async (req, res) => {
    const { workspaceId } = req.params;
    const userId = req.user._id;

    try {
        const workspace = await Workspace.findById(workspaceId);

        if (!workspace) {
            return res.status(404).json({
                success: false,
                message: 'Workspace not found'
            });
        }

        if (workspace.owner.toString() === userId.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Owner cannot leave workspace. Transfer ownership or delete workspace.'
            });
        }

        const memberIndex = workspace.members.findIndex(
            m => m.user.toString() === userId.toString()
        );

        if (memberIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'You are not a member of this workspace'
            });
        }

        workspace.members.splice(memberIndex, 1);
        await workspace.save();

        return res.status(200).json({
            success: true,
            message: 'Successfully left workspace'
        });

    } catch (error) {
        console.error('Leave workspace error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to leave workspace',
            error: error.message
        });
    }
}


export const getWorkspaceMembers = async (req, res) => {
    const { workspaceId } = req.params;
    const userId = req.user._id;

    try {
        const workspace = await Workspace.findById(workspaceId)
            .populate('owner', 'name email avatar')
            .populate('members.user', 'name email avatar');

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

        const members = [
            {
                user: workspace.owner,
                role: 'owner',
                joinedAt: workspace.createdAt
            },
            ...workspace.members
        ];

        return res.status(200).json({
            success: true,
            data: { members }
        });

    } catch (error) {
        console.error('Get workspace members error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch workspace members',
            error: error.message
        });
    }
};


export const getWorkspaceInvitations = async (req, res) => {
    const { workspaceId } = req.params;
    const userId = req.user._id;

    try {
        const workspace = await Workspace.findById(workspaceId)
            .populate('invitations.invitedBy', 'name email');

        if (!workspace) {
            return res.status(404).json({
                success: false,
                message: 'Workspace not found'
            });
        }

        const hasPermission = workspace.hasPermission(userId, 'invite');
        if (!hasPermission) {
            return res.status(403).json({
                success: false,
                message: 'No permission to view invitations'
            });
        }

        const now = new Date();
        const pendingInvitations = workspace.invitations.filter(
            inv => inv.status === 'pending' && inv.expiresAt > now
        );

        return res.status(200).json({
            success: true,
            data: { invitations: pendingInvitations }
        });

    } catch (error) {
        console.error('Get workspace invitations error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch invitations',
            error: error.message
        });
    }
};


/**
 * Get user's pending invitations across all workspaces
 * GET /api/workspaces/invitations/pending
 */
export const getUserPendingInvitations = async (req, res) => {
    try {
        const userEmail = req.user.email;

        const workspaces = await Workspace.find({
            'invitations.email': userEmail,
            'invitations.status': 'pending'
        })
        .populate('owner', 'name email')
        .populate('invitations.invitedBy', 'name email')
        .select('name description invitations');

        const pendingInvitations = [];
        
        workspaces.forEach((workspace) => {
            const userInvitations = workspace.invitations.filter(
                (inv) => inv.email === userEmail && inv.status === 'pending'
            );
            
            userInvitations.forEach((invitation) => {
                pendingInvitations.push({
                    _id: invitation._id,
                    workspace: {
                        _id: workspace._id,
                        name: workspace.name,
                        description: workspace.description
                    },
                    email: invitation.email,
                    role: invitation.role,
                    token: invitation.token,
                    invitedBy: invitation.invitedBy,
                    invitedAt: invitation.invitedAt,
                    status: invitation.status
                });
            });
        });

        return res.status(200).json({
            success: true,
            message: 'Pending invitations retrieved successfully',
            data: { invitations: pendingInvitations }
        });

    } catch (error) {
        console.error('Get pending invitations error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve pending invitations',
            error: error.message
        });
    }
};
