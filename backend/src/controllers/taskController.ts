import { Response } from "express";
import Task from "../models/Task.js";
import Project from "../models/Project.js";
import { AuthenticatedRequest } from "../types/index.js";

export const getProjectTasks = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { projectId } = req.params;
        const userId = req.user._id;

        const project = await Project.findOne({
            _id: projectId,
            "members.user": userId
        });

        if (!project) {
            res.status(404).json({
                success: false,
                message: "Project not found or access denied"
            });
            return;
        }

        const tasks = await Task.find({ project: projectId })
            .populate('assignee', 'name email avatar')
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: tasks
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const getTask = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { taskId } = req.params;
    const userId = req.user._id;

    try {
        const task = await Task.findById(taskId)
            .populate('assignee', 'name email avatar')
            .populate('createdBy', 'name email');

        if (!task) {
            res.status(404).json({
                success: false,
                message: "Task not found"
            });
            return;
        }

        const project = await Project.findOne({
            _id: task.project,
            "members.user": userId
        });

        if (!project) {
            res.status(403).json({
                success: false,
                message: "Access denied"
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: task
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


export const createTask = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { title, description, status, priority, assignee, projectId, dueDate, labels } = req.body;
    const userId = req.user._id;

    try {
        const project = await Project.findOne({
            _id: projectId,
            "members.user": userId
        });

        if (!project) {
            res.status(404).json({
                success: false,
                message: "Project not found or access denied"
            });
            return;
        }

        // Check if user has permission to create tasks (owner or editor)
        const userRole = project.getMemberRole(userId);
        if (userRole !== 'owner' && userRole !== 'editor') {
            res.status(403).json({
                success: false,
                message: "Only project owners and editors can create tasks"
            });
            return;
        }

        const task = await Task.create({
            title: title.trim(),
            description: description || '',
            status: status || 'todo',
            priority: priority || 'medium',
            assignee: assignee || null,
            project: projectId,
            workspace: project.workspace,
            dueDate: dueDate || null,
            labels: labels || [],
            subtasks: [],
            createdBy: userId
        });

        const populatedTask = await Task.findById(task._id)
            .populate('assignee', 'name email avatar')
            .populate('createdBy', 'name email');

        // Update project progress
        await project.updateProgress();

        // Broadcast task creation to all users in project room
        const io = req.app.get('io');
        if (io) {
            io.to(`project:${projectId}`).emit('task:created', {
                task: populatedTask,
                createdBy: req.user
            });
        }

        res.status(201).json({
            success: true,
            message: "Task created successfully",
            data: populatedTask
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


export const updateTask = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { taskId } = req.params;
    const userId = req.user._id;
    const updates = req.body;

    try {
        const task = await Task.findById(taskId);

        if (!task) {
            res.status(404).json({
                success: false,
                message: "Task not found"
            });
            return;
        }

        const project = await Project.findOne({
            _id: task.project,
            "members.user": userId
        });

        if (!project) {
            res.status(403).json({
                success: false,
                message: "Access denied"
            });
            return;
        }

        // Check permission: Only owner and editor can update tasks
        const userRole = project.getMemberRole(userId);
        if (userRole !== 'owner' && userRole !== 'editor') {
            res.status(403).json({
                success: false,
                message: "Only project owners and editors can update tasks"
            });
            return;
        }

        if (updates.title !== undefined) task.title = updates.title.trim();
        if (updates.description !== undefined) task.description = updates.description;
        if (updates.status !== undefined) task.status = updates.status;
        if (updates.priority !== undefined) task.priority = updates.priority;
        if (updates.assignee !== undefined) task.assignee = updates.assignee;
        if (updates.dueDate !== undefined) task.dueDate = updates.dueDate;
        if (updates.subtasks !== undefined) task.subtasks = updates.subtasks;
        if (updates.labels !== undefined) task.labels = updates.labels;

        await task.save();

        const updatedTask = await Task.findById(taskId)
            .populate('assignee', 'name email avatar')
            .populate('createdBy', 'name email');

        // Update project progress if status was changed
        if (updates.status !== undefined) {
            await project.updateProgress();
        }

        // Broadcast task update to all users in project room
        const io = req.app.get('io');
        if (io) {
            io.to(`project:${task.project}`).emit('task:updated', {
                taskId: taskId,
                task: updatedTask,
                updatedBy: req.user
            });
        }

        res.status(200).json({
            success: true,
            message: "Task updated successfully",
            data: updatedTask
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


export const deleteTask = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { taskId } = req.params;
    const userId = req.user._id;

    try {
        const task = await Task.findById(taskId);

        if (!task) {
            res.status(404).json({
                success: false,
                message: "Task not found"
            });
            return;
        }

        const project = await Project.findOne({
            _id: task.project,
            "members.user": userId
        }).populate('workspace');

        if (!project) {
            res.status(403).json({
                success: false,
                message: "Access denied"
            });
            return;
        }

        // Check if user is project owner
        const isProjectOwner = project.owner.toString() === userId.toString();

        // Check if user is workspace admin/owner
        const workspace = project.workspace as any;
        const isWorkspaceOwner = workspace && workspace.owner && workspace.owner.toString() === userId.toString();
        const workspaceMember = workspace?.members?.find((m: any) =>
            (typeof m.user === 'string' ? m.user : m.user._id).toString() === userId.toString()
        );
        const isWorkspaceAdmin = workspaceMember && (workspaceMember.role === 'admin' || workspaceMember.role === 'owner');

        // Only project owner or workspace admin/owner can delete tasks
        if (!isProjectOwner && !isWorkspaceOwner && !isWorkspaceAdmin) {
            res.status(403).json({
                success: false,
                message: "Only project owners or workspace admins can delete tasks"
            });
            return;
        }

        const projectId = task.project.toString();

        await Task.findByIdAndDelete(taskId);

        // Update project progress after deletion
        await project.updateProgress();

        // Broadcast task deletion to all users in project room
        const io = req.app.get('io');
        if (io) {
            io.to(`project:${projectId}`).emit('task:deleted', {
                taskId: taskId,
                deletedBy: req.user
            });
        }

        res.status(200).json({
            success: true,
            message: "Task deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
