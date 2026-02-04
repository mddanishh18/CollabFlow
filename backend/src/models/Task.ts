import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { ITask } from '../types/index.js';

// Interface for Task Document
export interface ITaskDocument extends Omit<ITask, '_id' | 'createdAt' | 'updatedAt'>, Document {
    // Add any instance methods here if needed
}

// Interface for Task Model with static methods
export interface ITaskModel extends Model<ITaskDocument> {
    // Add any static methods here if needed
}

const taskSchema = new Schema<ITaskDocument, ITaskModel>({
    title: {
        type: String,
        required: [true, 'Task title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    status: {
        type: String,
        enum: ['todo', 'in-progress', 'review', 'done'],
        default: 'todo'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    assignee: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    project: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    workspace: {
        type: Schema.Types.ObjectId,
        ref: 'Workspace',
        required: true
    },
    dueDate: {
        type: Date,
        default: null
    },
    subtasks: [{
        title: {
            type: String,
            required: true
        },
        completed: {
            type: Boolean,
            default: false
        }
    }],
    labels: [{
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 30
        },
        color: {
            type: String,
            required: true,
            match: /^#[0-9A-F]{6}$/i // Hex color validation
        }
    }],
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Indexes for better query performance
taskSchema.index({ project: 1, status: 1 });
taskSchema.index({ project: 1, createdAt: -1 });
taskSchema.index({ assignee: 1 });
taskSchema.index({ workspace: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ title: 'text', description: 'text' });

/**
 * Task Model
 * Represents an individual unit of work within a project.
 */
export default mongoose.model<ITaskDocument, ITaskModel>('Task', taskSchema);