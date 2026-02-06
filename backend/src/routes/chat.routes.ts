import express, { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { validateObjectId } from '../middleware/validation.middleware.js';
import { wrap } from '../utils/routeHandler.js';
import {
    getWorkspaceChannels,
    getChannelById,
    createChannel,
    updateChannel,
    deleteChannel,
    addChannelMember,
    removeChannelMember,
    getChannelMessages,
    createMessage,
    updateMessage,
    deleteMessage,
    markMessagesAsRead,
    getUnreadCount,
    getWorkspaceUnreadCounts
} from '../controllers/chatController.js';

const router: Router = express.Router();

// All routes require authentication
router.use(protect);

// Channel routes
router.get('/workspace/:workspaceId/channels', validateObjectId('workspaceId'), wrap(getWorkspaceChannels));
router.get('/channels/:channelId', validateObjectId('channelId'), wrap(getChannelById));
router.post('/channels', wrap(createChannel));
router.patch('/channels/:channelId', validateObjectId('channelId'), wrap(updateChannel));
router.delete('/channels/:channelId', validateObjectId('channelId'), wrap(deleteChannel));

// Channel member routes
router.post('/channels/:channelId/members', validateObjectId('channelId'), wrap(addChannelMember));
router.delete('/channels/:channelId/members', validateObjectId('channelId'), wrap(removeChannelMember));

// Message routes
router.get('/channels/:channelId/messages', validateObjectId('channelId'), wrap(getChannelMessages));
router.post('/channels/:channelId/messages', validateObjectId('channelId'), wrap(createMessage));
router.patch('/messages/:messageId', validateObjectId('messageId'), wrap(updateMessage));
router.delete('/messages/:messageId', validateObjectId('messageId'), wrap(deleteMessage));

// Read receipts
router.post('/channels/:channelId/read', validateObjectId('channelId'), wrap(markMessagesAsRead));

// Unread counts
router.get('/channels/:channelId/unread-count', validateObjectId('channelId'), wrap(getUnreadCount));
router.get('/workspace/:workspaceId/unread-counts', validateObjectId('workspaceId'), wrap(getWorkspaceUnreadCounts));

export default router;
