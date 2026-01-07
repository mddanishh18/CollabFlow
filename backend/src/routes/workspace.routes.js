import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { validateRequest, validateObjectId } from '../middleware/validation.middleware.js';
import {
    createWorkspaceSchema,
    updateWorkspaceSchema,
    inviteMemberSchema,
    updateMemberRoleSchema
} from '../utils/validationSchemas.js';
import {
    createWorkspace,
    getUserWorkspaces,
    getWorkspaceById,
    updateWorkspace,
    deleteWorkspace,
    inviteMember,
    acceptInvitation,
    removeMember,
    updateMemberRole,
    leaveWorkspace,
    getWorkspaceMembers,
    getWorkspaceInvitations,
    getUserPendingInvitations
} from '../controllers/workspaceController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// IMPORTANT: This route must be before /:workspaceId routes to avoid conflicts
router.get('/invitations/pending', getUserPendingInvitations);

// Workspace CRUD
router.post(
    '/',
    validateRequest(createWorkspaceSchema),
    createWorkspace
);

router.get('/', getUserWorkspaces);

router.get(
    '/:workspaceId',
    validateObjectId('workspaceId'),
    getWorkspaceById
);

router.patch(
    '/:workspaceId',
    validateObjectId('workspaceId'),
    validateRequest(updateWorkspaceSchema),
    updateWorkspace
);

router.delete(
    '/:workspaceId',
    validateObjectId('workspaceId'),
    deleteWorkspace
);

// Member Management
router.post(
    '/:workspaceId/invite',
    validateObjectId('workspaceId'),
    validateRequest(inviteMemberSchema),
    inviteMember
);

router.post('/invite/accept/:token', acceptInvitation);

router.delete(
    '/:workspaceId/members/:memberId',
    validateObjectId('workspaceId'),
    validateObjectId('memberId'),
    removeMember
);

router.patch(
    '/:workspaceId/members/:memberId/role',
    validateObjectId('workspaceId'),
    validateObjectId('memberId'),
    validateRequest(updateMemberRoleSchema),
    updateMemberRole
);

router.post(
    '/:workspaceId/leave',
    validateObjectId('workspaceId'),
    leaveWorkspace
);

router.get(
    '/:workspaceId/members',
    validateObjectId('workspaceId'),
    getWorkspaceMembers
);

router.get(
    '/:workspaceId/invitations',
    validateObjectId('workspaceId'),
    getWorkspaceInvitations
);

export default router;
