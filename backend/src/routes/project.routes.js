import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateRequest, validateObjectId } from '../middleware/validation.middleware.js';
import {
    createProjectSchema,
    updateProjectSchema,
    addProjectMemberSchema,
    updateProjectMemberRoleSchema
} from '../utils/validationSchemas.js';
import {
    createProject,
    getUserProjects,
    getProjectById,
    updateProject,
    deleteProject,
    addProjectMember,
    removeProjectMember,
    updateProjectMemberRole,
    leaveProject,
    getProjectMembers,
    getWorkspaceProjects
} from '../controllers/projectController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Project CRUD
router.post(
    '/',
    validateRequest(createProjectSchema),
    createProject
);

router.get('/', getUserProjects);

router.get(
    '/workspace/:workspaceId',
    validateObjectId('workspaceId'),
    getWorkspaceProjects
);

router.get(
    '/:projectId',
    validateObjectId('projectId'),
    getProjectById
);

router.patch(
    '/:projectId',
    validateObjectId('projectId'),
    validateRequest(updateProjectSchema),
    updateProject
);

router.delete(
    '/:projectId',
    validateObjectId('projectId'),
    deleteProject
);

// Project Member Management
router.post(
    '/:projectId/members',
    validateObjectId('projectId'),
    validateRequest(addProjectMemberSchema),
    addProjectMember
);

router.delete(
    '/:projectId/members/:memberId',
    validateObjectId('projectId'),
    validateObjectId('memberId'),
    removeProjectMember
);

router.patch(
    '/:projectId/members/:memberId/role',
    validateObjectId('projectId'),
    validateObjectId('memberId'),
    validateRequest(updateProjectMemberRoleSchema),
    updateProjectMemberRole
);

router.post(
    '/:projectId/leave',
    validateObjectId('projectId'),
    leaveProject
);

router.get(
    '/:projectId/members',
    validateObjectId('projectId'),
    getProjectMembers
);

export default router;
