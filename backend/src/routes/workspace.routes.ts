import express, { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { validateRequest, validateObjectId } from '../middleware/validation.middleware.js';
import {
    createWorkspaceSchema,
    updateWorkspaceSchema,
    inviteMemberSchema,
    updateMemberRoleSchema
} from '../utils/validationSchemas.js';
import { wrap } from '../utils/routeHandler.js';
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

const router: Router = express.Router();

// All routes require authentication
router.use(protect);

// IMPORTANT: This route must be before /:workspaceId routes to avoid conflicts
router.get('/invitations/pending', wrap(getUserPendingInvitations));

// Workspace CRUD
router.post(
    '/',
    validateRequest(createWorkspaceSchema),
    wrap(createWorkspace)
);

router.get('/', wrap(getUserWorkspaces));

router.get(
    '/:workspaceId',
    validateObjectId('workspaceId'),
    wrap(getWorkspaceById)
);

router.patch(
    '/:workspaceId',
    validateObjectId('workspaceId'),
    validateRequest(updateWorkspaceSchema),
    wrap(updateWorkspace)
);

router.delete(
    '/:workspaceId',
    validateObjectId('workspaceId'),
    wrap(deleteWorkspace)
);

// Member Management
router.post(
    '/:workspaceId/invite',
    validateObjectId('workspaceId'),
    validateRequest(inviteMemberSchema),
    wrap(inviteMember)
);

router.post('/invite/accept/:token', wrap(acceptInvitation));

router.delete(
    '/:workspaceId/members/:memberId',
    validateObjectId('workspaceId'),
    validateObjectId('memberId'),
    wrap(removeMember)
);

router.patch(
    '/:workspaceId/members/:memberId/role',
    validateObjectId('workspaceId'),
    validateObjectId('memberId'),
    validateRequest(updateMemberRoleSchema),
    wrap(updateMemberRole)
);

router.post(
    '/:workspaceId/leave',
    validateObjectId('workspaceId'),
    wrap(leaveWorkspace)
);

router.get(
    '/:workspaceId/members',
    validateObjectId('workspaceId'),
    wrap(getWorkspaceMembers)
);

router.get(
    '/:workspaceId/invitations',
    validateObjectId('workspaceId'),
    wrap(getWorkspaceInvitations)
);

export default router;
