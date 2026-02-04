import { Response } from "express";
import { Types } from "mongoose";
import { AuthenticatedRequest } from "../types/index.js";
import Channel from "../models/Channel.js";
import Message from "../models/Message.js";
import Workspace from "../models/Workspace.js";
import { getIO } from "../sockets/index.js";


export const getWorkspaceChannels = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { workspaceId } = req.params;
    const userId = req.user._id;

    try {
        // Verify workspace exists and user is member
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            res.status(404).json({
                success: false,
                message: "Workspace not found"
            });
            return;
        }

        if (!workspace.isMember(userId)) {
            res.status(403).json({
                success: false,
                message: "Access denied. You are not a member of this workspace"
            });
            return;
        }

        const channels = await Channel.getWorkspaceChannels(workspaceId, userId);

        res.status(200).json({
            success: true,
            message: channels.length === 0 ? "No channels found" : "Channels retrieved successfully",
            data: channels
        });

    } catch (error) {
        console.error('[getWorkspaceChannels] Error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve channels",
            error: (error as Error).message
        });
    }
};

export const getChannelById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const {channelId} = req.params;
    const userId = req.user._id;

    try {
        const channel = await Channel.findById(channelId)
            .populate('members', 'name email avatar')
            .populate('workspace', 'name')
            .populate('createdBy', 'name email');

        if (!channel) {
            res.status(404).json({
                success: false,
                message: "Channel not found"
            });
            return;
        }

        // Check access: public channels or user is member
        if (channel.type === 'public') {
            // For public channels, verify user is workspace member
            const workspace = await Workspace.findById(channel.workspace);
            if (!workspace || !workspace.isMember(userId)) {
                res.status(403).json({
                    success: false,
                    message: "Access denied. You are not a member of this workspace"
                });
                return;
            }
        } else {
            // For private/direct channels, user must be channel member
            if (!channel.isMember(userId)) {
                res.status(403).json({
                    success: false,
                    message: "Access denied. You are not a member of this channel"
                });
                return;
            }
        }

        res.status(200).json({
            success: true,
            message: "Channel retrieved successfully",
            data: channel
        });
    } catch (error) {
        console.error('Get channel by ID error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve channel",
            error: (error as Error).message
        });
    }
};


export const createChannel = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const {name, description, type, members, project, workspaceId} = req.body;
    const userId = req.user._id;

    try {
        const workspace = await Workspace.findById(workspaceId).populate('members.user', '_id');
        if (!workspace) {
            res.status(404).json({
                success: false,
                message: "Workspace not found"
            });
            return;
        }

        if (!workspace.isMember(userId)) {
            res.status(403).json({
                success: false,
                message: "You must be a workspace member to create channels"
            });
            return;
        }

        // Check if user is admin/owner for public channel creation
        if (type === 'public') {
            const userRole = workspace.getMemberRole(userId);
            if (userRole !== 'admin' && userRole !== 'owner') {
                res.status(403).json({
                    success: false,
                    message: "Only workspace admins and owners can create public channels"
                });
                return;
            }

            // Check if a public channel already exists
            const existingPublicChannel = await Channel.findOne({
                workspace: workspaceId,
                type: 'public'
            });

            if (existingPublicChannel) {
                res.status(400).json({
                    success: false,
                    message: "A public channel already exists in this workspace. Only one public channel is allowed per workspace."
                });
                return;
            }
        }

        // For direct messages, auto-generate name as 'DM' (frontend will display other user's name)
        const channelName = type === 'direct' ? 'DM' : name.trim();

        // For public channels, automatically add ALL workspace members
        let channelMembers: string[];
        if (type === 'public') {
            // Get all workspace member IDs (owner + members)
            const allMemberIds = workspace.members.map(m => {
                const user = m.user;
                if (typeof user === 'string') {
                    return user;
                }
                return (user as any)._id?.toString() || user.toString();
            });
            const owner = workspace.owner;
            let ownerId: string;
            if (typeof owner === 'string') {
                ownerId = owner;
            } else {
                ownerId = (owner as any)._id?.toString() || owner.toString();
            }
            
            // Combine and deduplicate (owner might also be in members array)
            const allIds = new Set([ownerId, ...allMemberIds]);
            channelMembers = Array.from(allIds);
            
            console.log(`[createChannel] Public channel - Adding ${channelMembers.length} members:`, channelMembers);
        } else {
            // For private/direct, use provided members plus creator
            channelMembers = [userId, ...(members || [])];
        }

        const channel = await Channel.create({
            name: channelName,
            description: description || '',
            type: type || 'public',
            members: channelMembers,
            project: project || null,
            workspace: workspaceId,
            createdBy: userId
        });

        await channel.populate('members', 'name email avatar');
        await channel.populate('workspace', 'name');

        res.status(201).json({
            success: true,
            message: "Channel created successfully",
            data: channel
        });
    } catch (error) {
        console.error('Create channel error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to create channel",
            error: (error as Error).message
        });
    }
}

export const updateChannel = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { channelId } = req.params;
    const { name, description } = req.body;
    const userId = req.user._id;

    try {
        const channel = await Channel.findById(channelId);
        if (!channel) {
            res.status(404).json({
                success: false,
                message: "Channel not found"
            });
            return;
        }

        if (!channel.isMember(userId)) {
            res.status(403).json({
                success: false,
                message: "Access denied"
            });
            return;
        }

        if (name) channel.name = name.trim();
        if (description !== undefined) channel.description = description.trim();

        await channel.save();
        await channel.populate('members', 'name email avatar');
        await channel.populate('workspace', 'name');

        res.status(200).json({
            success: true,
            message: "Channel updated successfully",
            data: channel
        });
    } catch (error) {
        console.error('Update channel error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to update channel",
            error: (error as Error).message
        });
    }
};

export const deleteChannel = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { channelId } = req.params;
    const userId = req.user._id;

    try {
        const channel = await Channel.findById(channelId);
        if (!channel) {
            res.status(404).json({
                success: false,
                message: "Channel not found"
            });
            return;
        }

        const workspace = await Workspace.findById(channel.workspace);
        if (!workspace) {
            res.status(404).json({
                success: false,
                message: "Workspace not found"
            });
            return;
        }

        const isCreator = channel.createdBy.toString() === userId.toString();
        const memberData = workspace.members.find(m => m.user.toString() === userId.toString());
        const isOwnerOrAdmin = memberData && ['owner', 'admin'].includes(memberData.role);

        if (!isCreator && !isOwnerOrAdmin) {
            res.status(403).json({
                success: false,
                message: "Access denied"
            });
            return;
        }

        await Message.deleteMany({ channel: channelId });
        await channel.deleteOne();

        res.status(200).json({
            success: true,
            message: "Channel deleted successfully"
        });
    } catch (error) {
        console.error('Delete channel error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to delete channel",
            error: (error as Error).message
        });
    }
};

export const addChannelMember = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { channelId } = req.params;
    const { userId: newUserId } = req.body;
    const userId = req.user._id;

    try {
        const channel = await Channel.findById(channelId);
        if (!channel) {
            res.status(404).json({
                success: false,
                message: "Channel not found"
            });
            return;
        }

        if (!channel.isMember(userId)) {
            res.status(403).json({
                success: false,
                message: "Access denied"
            });
            return;
        }

        await channel.addMember(newUserId);
        await channel.populate('members', 'name email avatar');

        res.status(200).json({
            success: true,
            message: "Member added successfully",
            data: channel
        });
    } catch (error) {
        console.error('Add channel member error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to add member",
            error: (error as Error).message
        });
    }
};

export const removeChannelMember = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { channelId } = req.params;
    const { userId: removeUserId } = req.body;
    const userId = req.user._id;

    try {
        const channel = await Channel.findById(channelId);
        if (!channel) {
            res.status(404).json({
                success: false,
                message: "Channel not found"
            });
            return;
        }

        if (!channel.isMember(userId)) {
            res.status(403).json({
                success: false,
                message: "Access denied"
            });
            return;
        }

        const isSelfRemoval = removeUserId === userId.toString();
        const isCreator = channel.createdBy.toString() === userId.toString();

        if (!isSelfRemoval && !isCreator) {
            res.status(403).json({
                success: false,
                message: "Access denied"
            });
            return;
        }

        await channel.removeMember(removeUserId);
        await channel.populate('members', 'name email avatar');

        res.status(200).json({
            success: true,
            message: "Member removed successfully",
            data: channel
        });
    } catch (error) {
        console.error('Remove channel member error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to remove member",
            error: (error as Error).message
        });
    }
};

export const getChannelMessages = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { channelId } = req.params;
    const { limit = 50, before } = req.query;
    const userId = req.user._id;

    try {
        const channel = await Channel.findById(channelId);
        if (!channel) {
            res.status(404).json({
                success: false,
                message: "Channel not found"
            });
            return;
        }

        // Check access: public channels (workspace members) or channel members
        if (channel.type === 'public') {
            const workspace = await Workspace.findById(channel.workspace);
            if (!workspace || !workspace.isMember(userId)) {
                res.status(403).json({
                    success: false,
                    message: "Access denied. You are not a member of this workspace"
                });
                return;
            }
        } else if (!channel.isMember(userId)) {
            res.status(403).json({
                success: false,
                message: "Access denied. You are not a member of this channel"
            });
            return;
        }

        const messages = await Message.getChannelMessages(channelId, Number(limit), before as string);

        res.status(200).json({
            success: true,
            data: messages.reverse()
        });
    } catch (error) {
        console.error('Get channel messages error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve messages",
            error: (error as Error).message
        });
    }
};

export const createMessage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { channelId } = req.params;
    const { content, type, attachments, replyTo, mentions } = req.body;
    const userId = req.user._id;

    try {
        const channel = await Channel.findById(channelId);
        if (!channel) {
            res.status(404).json({
                success: false,
                message: "Channel not found"
            });
            return;
        }

        // Check access: public channels (workspace members) or channel members
        if (channel.type === 'public') {
            const workspace = await Workspace.findById(channel.workspace);
            if (!workspace || !workspace.isMember(userId)) {
                res.status(403).json({
                    success: false,
                    message: "Access denied. You are not a member of this workspace"
                });
                return;
            }
        } else if (!channel.isMember(userId)) {
            res.status(403).json({
                success: false,
                message: "Access denied. You are not a member of this channel"
            });
            return;
        }

        const message = await Message.create({
            channel: channelId,
            sender: userId,
            content: content.trim(),
            type: type || 'text',
            attachments: attachments || [],
            replyTo: replyTo || null,
            mentions: mentions || []
        });

        channel.lastMessage = message._id as Types.ObjectId;
        channel.lastActiveAt = new Date();
        await channel.save();

        await message.populate('sender', 'name email avatar');
        if (replyTo) {
            await message.populate({
                path: 'replyTo',
                select: 'content sender',
                populate: { path: 'sender', select: 'name email avatar' }
            });
        }

        // Broadcast message via socket to all users in the channel
        try {
            const io = getIO();
            console.log(`[createMessage] Broadcasting message to channel:${channelId}`);
            io.to(`channel:${channelId}`).emit('message:new', message);
            console.log(`[createMessage] Emitted 'message:new' to channel:${channelId}`);
        } catch (socketError) {
            console.error('[createMessage] Socket broadcast error:', socketError);
            // Don't fail the request if socket broadcast fails
        }

        res.status(201).json({
            success: true,
            message: "Message sent successfully",
            data: message
        });
    } catch (error) {
        console.error('Create message error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to send message",
            error: (error as Error).message
        });
    }
};

export const updateMessage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { messageId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    try {
        const message = await Message.findById(messageId);
        if (!message) {
            res.status(404).json({
                success: false,
                message: "Message not found"
            });
            return;
        }

        if (message.sender.toString() !== userId.toString()) {
            res.status(403).json({
                success: false,
                message: "Access denied"
            });
            return;
        }

        if (message.isDeleted) {
            res.status(400).json({
                success: false,
                message: "Cannot edit deleted messages"
            });
            return;
        }

        message.content = content.trim();
        message.isEdited = true;
        await message.save();
        await message.populate('sender', 'name email avatar');

        res.status(200).json({
            success: true,
            message: "Message updated successfully",
            data: message
        });
    } catch (error) {
        console.error('Update message error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to update message",
            error: (error as Error).message
        });
    }
};

export const deleteMessage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { messageId } = req.params;
    const userId = req.user._id;

    try {
        const message = await Message.findById(messageId);
        if (!message) {
            res.status(404).json({
                success: false,
                message: "Message not found"
            });
            return;
        }

        const channel = await Channel.findById(message.channel);
        if (!channel) {
            res.status(404).json({
                success: false,
                message: "Channel not found"
            });
            return;
        }

        const isSender = message.sender.toString() === userId.toString();
        const isChannelCreator = channel.createdBy.toString() === userId.toString();

        if (!isSender && !isChannelCreator) {
            res.status(403).json({
                success: false,
                message: "Access denied"
            });
            return;
        }

        await message.softDelete();

        res.status(200).json({
            success: true,
            message: "Message deleted successfully"
        });
    } catch (error) {
        console.error('Delete message error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to delete message",
            error: (error as Error).message
        });
    }
};

export const markMessagesAsRead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { channelId } = req.params;
    const userId = req.user._id;

    try {
        const channel = await Channel.findById(channelId);
        if (!channel) {
            res.status(404).json({
                success: false,
                message: "Channel not found"
            });
            return;
        }

        // Check access: public channels (workspace members) or channel members
        if (channel.type === 'public') {
            const workspace = await Workspace.findById(channel.workspace);
            if (!workspace || !workspace.isMember(userId)) {
                res.status(403).json({
                    success: false,
                    message: "Access denied. You are not a member of this workspace"
                });
                return;
            }
        } else if (!channel.isMember(userId)) {
            res.status(403).json({
                success: false,
                message: "Access denied. You are not a member of this channel"
            });
            return;
        }

        const unreadMessages = await Message.find({
            channel: channelId,
            sender: { $ne: userId },
            readBy: { $nin: [userId] },
            isDeleted: false
        });

        await Promise.all(unreadMessages.map(msg => msg.markAsRead(userId)));

        res.status(200).json({
            success: true,
            message: `${unreadMessages.length} message(s) marked as read`
        });
    } catch (error) {
        console.error('Mark messages as read error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to mark messages as read",
            error: (error as Error).message
        });
    }
};