import express, { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateRequest, validateObjectId } from '../middleware/validation.middleware.js';
import {
    createProjectSchema,
    updateProjectSchema,
    addProjectMemberSchema,
    updateProjectMemberRoleSchema
} from '../utils/validationSchemas.js';
import { wrap } from '../utils/routeHandler.js';
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

const router: Router = express.Router();

// All routes require authentication
router.use(authenticate);

// Project CRUD
router.post(
    '/',
    validateRequest(createProjectSchema),
    wrap(createProject)
);

router.get('/', wrap(getUserProjects));

router.get(
    '/workspace/:workspaceId',
    validateObjectId('workspaceId'),
    wrap(getWorkspaceProjects)
);

router.get(
    '/:projectId',
    validateObjectId('projectId'),
    wrap(getProjectById)
);

router.patch(
    '/:projectId',
    validateObjectId('projectId'),
    validateRequest(updateProjectSchema),
    wrap(updateProject)
);

router.delete(
    '/:projectId',
    validateObjectId('projectId'),
    wrap(deleteProject)
);

// Project Member Management
router.post(
    '/:projectId/members',
    validateObjectId('projectId'),
    validateRequest(addProjectMemberSchema),
    wrap(addProjectMember)
);

router.delete(
    '/:projectId/members/:memberId',
    validateObjectId('projectId'),
    validateObjectId('memberId'),
    wrap(removeProjectMember)
);

router.patch(
    '/:projectId/members/:memberId/role',
    validateObjectId('projectId'),
    validateObjectId('memberId'),
    validateRequest(updateProjectMemberRoleSchema),
    wrap(updateProjectMemberRole)
);

router.post(
    '/:projectId/leave',
    validateObjectId('projectId'),
    wrap(leaveProject)
);

router.get(
    '/:projectId/members',
    validateObjectId('projectId'),
    wrap(getProjectMembers)
);

export default router;
