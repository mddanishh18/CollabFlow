import { z } from 'zod';

// ============================================
// WORKSPACE VALIDATION SCHEMAS
// ============================================

/**
 * Schema for creating a workspace
 */
export const createWorkspaceSchema = z.object({
    name: z
        .string()
        .min(2, 'Workspace name must be at least 2 characters')
        .max(100, 'Workspace name cannot exceed 100 characters')
        .trim(),
    description: z
        .string()
        .max(500, 'Description cannot exceed 500 characters')
        .optional()
        .default(''),
    settings: z
        .object({
            isPublic: z.boolean().optional().default(false),
            allowMemberInvites: z.boolean().optional().default(false),
            defaultProjectVisibility: z
                .enum(['private', 'workspace', 'public'])
                .optional()
                .default('workspace')
        })
        .optional()
});

/**
 * Schema for updating a workspace
 */
export const updateWorkspaceSchema = z.object({
    name: z
        .string()
        .min(2, 'Workspace name must be at least 2 characters')
        .max(100, 'Workspace name cannot exceed 100 characters')
        .trim()
        .optional(),
    description: z
        .string()
        .max(500, 'Description cannot exceed 500 characters')
        .optional(),
    settings: z
        .object({
            isPublic: z.boolean().optional(),
            allowMemberInvites: z.boolean().optional(),
            defaultProjectVisibility: z
                .enum(['private', 'workspace', 'public'])
                .optional()
        })
        .optional()
});

/**
 * Schema for inviting a member
 */
export const inviteMemberSchema = z.object({
    email: z
        .string()
        .email('Please provide a valid email address')
        .toLowerCase()
        .trim(),
    role: z
        .enum(['admin', 'member', 'viewer'], {
            errorMap: () => ({ message: 'Role must be admin, member, or viewer' })
        })
        .default('member')
});

/**
 * Schema for updating member role
 */
export const updateMemberRoleSchema = z.object({
    role: z.enum(['admin', 'member', 'viewer'], {
        errorMap: () => ({ message: 'Role must be admin, member, or viewer' })
    })
});

/**
 * Schema for MongoDB ObjectId validation
 */
export const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, {
    message: 'Invalid ID format'
});

// ============================================
// PROJECT VALIDATION SCHEMAS (For future use)
// ============================================

/**
 * Schema for creating a project
 */
export const createProjectSchema = z.object({
    name: z
        .string()
        .min(2, 'Project name must be at least 2 characters')
        .max(100, 'Project name cannot exceed 100 characters')
        .trim(),
    description: z
        .string()
        .max(1000, 'Description cannot exceed 1000 characters')
        .optional()
        .default(''),
    workspace: objectIdSchema,
    status: z
        .enum(['planning', 'active', 'on-hold', 'completed', 'archived'])
        .optional()
        .default('planning'),
    priority: z
        .enum(['low', 'medium', 'high', 'urgent'])
        .optional()
        .default('medium'),
    startDate: z.string().datetime().optional().nullable(),
    dueDate: z.string().datetime().optional().nullable(),
    tags: z.array(z.string().max(30)).max(10, 'Maximum 10 tags allowed').optional(),
    color: z
        .string()
        .regex(/^#[0-9A-F]{6}$/i, 'Color must be a valid hex code')
        .optional()
        .default('#3B82F6'),
    visibility: z
        .enum(['private', 'workspace', 'public'])
        .optional()
        .default('workspace'),
    settings: z
        .object({
            allowComments: z.boolean().optional(),
            notifyOnTaskUpdate: z.boolean().optional(),
            enableRealTimeEditing: z.boolean().optional()
        })
        .optional()
});

/**
 * Schema for updating a project
 */
export const updateProjectSchema = z.object({
    name: z
        .string()
        .min(2)
        .max(100)
        .trim()
        .optional(),
    description: z.string().max(1000).optional(),
    status: z
        .enum(['planning', 'active', 'on-hold', 'completed', 'archived'])
        .optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    startDate: z.string().datetime().optional().nullable(),
    dueDate: z.string().datetime().optional().nullable(),
    tags: z.array(z.string().max(30)).max(10).optional(),
    color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
    visibility: z.enum(['private', 'workspace', 'public']).optional(),
    progress: z.number().min(0).max(100).optional()
});

/**
 * Schema for adding a project member
 */
export const addProjectMemberSchema = z.object({
    userId: objectIdSchema,
    role: z
        .enum(['editor', 'viewer'], {
            errorMap: () => ({ message: 'Role must be editor or viewer' })
        })
        .default('editor')
});

/**
 * Schema for updating project member role
 */
export const updateProjectMemberRoleSchema = z.object({
    role: z.enum(['editor', 'viewer'], {
        errorMap: () => ({ message: 'Role must be editor or viewer' })
    })
});

