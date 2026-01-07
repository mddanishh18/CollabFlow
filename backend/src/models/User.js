import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            minlength: [2, 'Name must be at least 2 characters'],
            maxlength: [50, 'Name cannot exceed 50 characters']
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [6, 'Password must be at least 6 characters'],
            select: false // Don't return password by default
        },
        avatar: {
            type: String,
            default: null
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user'
        },
        workspaces: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Workspace'
        }],
        isEmailVerified: {
            type: Boolean,
            default: false
        },
        lastActive: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true // Adds createdAt and updatedAt
    }
);

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for user ID as string
userSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

// Ensure virtuals are included when converting to JSON
userSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        delete ret.__v;
        delete ret.password;
        return ret;
    }
});

const User = mongoose.model('User', userSchema);

export default User;
