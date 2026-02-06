# Phase 3: Step-by-Step File Creation Order

> Create files in THIS order to avoid import errors

---

## Step 1: Task Model
**File:** `src/models/Task.ts`

```typescript
import mongoose, { Document, Schema } from "mongoose";
import { ITask, TaskDocument } from "../types";

const TaskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["todo", "in-progress", "review", "done"],
      default: "todo",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    assignee: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    workspace: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    dueDate: {
      type: Date,
    },
    subtasks: [
      {
        title: { type: String, required: true },
        completed: { type: Boolean, default: false },
      },
    ],
    labels: [
      {
        name: { type: String, required: true },
        color: { type: String, required: true },
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
TaskSchema.index({ project: 1, status: 1 });
TaskSchema.index({ assignee: 1 });
TaskSchema.index({ workspace: 1 });

export default mongoose.model<ITask>("Task", TaskSchema);
```

---

## Step 2: Task Controller
**File:** `src/controllers/taskController.ts`

```typescript
import { Response } from "express";
import Task from "../models/Task";
import Project from "../models/Project";
import { AuthenticatedRequest } from "../types";

// Get all tasks for a project
export const getProjectTasks = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { projectId } = req.params;
    const userId = req.user._id;

    // Verify project exists and user has access
    const project = await Project.findOne({
      _id: projectId,
      "members.user": userId,
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found or access denied" });
    }

    const tasks = await Task.find({ project: projectId })
      .populate("assignee", "name email avatar")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get single task
export const getTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { taskId } = req.params;
    const userId = req.user._id;

    const task = await Task.findById(taskId)
      .populate("assignee", "name email avatar")
      .populate("createdBy", "name email")
      .populate("project");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Verify user has access to the project
    const project = await Project.findOne({
      _id: task.project,
      "members.user": userId,
    });

    if (!project) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(task);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Create task
export const createTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description, status, priority, assignee, projectId, dueDate, labels } = req.body;
    const userId = req.user._id;

    // Verify project exists and user has access
    const project = await Project.findOne({
      _id: projectId,
      "members.user": userId,
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found or access denied" });
    }

    const task = await Task.create({
      title,
      description,
      status: status || "todo",
      priority: priority || "medium",
      assignee,
      project: projectId,
      workspace: project.workspace,
      dueDate,
      labels: labels || [],
      subtasks: [],
      createdBy: userId,
    });

    const populatedTask = await Task.findById(task._id)
      .populate("assignee", "name email avatar")
      .populate("createdBy", "name email");

    res.status(201).json(populatedTask);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// Update task
export const updateTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { taskId } = req.params;
    const updates = req.body;
    const userId = req.user._id;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Verify user has access
    const project = await Project.findOne({
      _id: task.project,
      "members.user": userId,
    });

    if (!project) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Update task
    Object.assign(task, updates);
    await task.save();

    const updatedTask = await Task.findById(taskId)
      .populate("assignee", "name email avatar")
      .populate("createdBy", "name email");

    res.json(updatedTask);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// Delete task
export const deleteTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { taskId } = req.params;
    const userId = req.user._id;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Verify user has access
    const project = await Project.findOne({
      _id: task.project,
      "members.user": userId,
    });

    if (!project) {
      return res.status(403).json({ message: "Access denied" });
    }

    await Task.findByIdAndDelete(taskId);
    res.json({ message: "Task deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
```

---

## Step 3: Task Routes
**File:** `src/routes/task.routes.ts`

```typescript
import express from "express";
import {
  getProjectTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
} from "../controllers/taskController";
import { authMiddleware } from "../middleware/auth.middleware";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get all tasks for a project
router.get("/project/:projectId", getProjectTasks);

// Get single task
router.get("/:taskId", getTask);

// Create task
router.post("/", createTask);

// Update task
router.patch("/:taskId", updateTask);

// Delete task
router.delete("/:taskId", deleteTask);

export default router;
```

---

## Step 4: Socket Auth Middleware
**File:** `src/sockets/middleware/socketAuth.ts`

```typescript
import { Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { JwtPayload } from "../../types";

export interface AuthenticatedSocket extends Socket {
  userId: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
}

export const socketAuthMiddleware = (
  socket: Socket,
  next: (err?: Error) => void
) => {
  try {
    // Get token from handshake auth
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Authentication required"));
    }

    // Verify JWT token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    // Attach user info to socket
    (socket as AuthenticatedSocket).userId = decoded.userId;
    (socket as AuthenticatedSocket).user = {
      _id: decoded.userId,
      name: decoded.name,
      email: decoded.email,
    };

    next();
  } catch (error) {
    next(new Error("Invalid or expired token"));
  }
};
```

---

## Step 5: Presence Handlers
**File:** `src/sockets/handlers/presenceHandlers.ts`

```typescript
import { Server } from "socket.io";
import { AuthenticatedSocket } from "../middleware/socketAuth";

// Track online users per room
export const onlineUsers = new Map<string, Set<string>>();

export const registerPresenceHandlers = (
  io: Server,
  socket: AuthenticatedSocket
) => {
  // User joins a project room
  socket.on("join:project", (projectId: string) => {
    const roomName = `project:${projectId}`;
    socket.join(roomName);

    // Track online users in this room
    if (!onlineUsers.has(roomName)) {
      onlineUsers.set(roomName, new Set());
    }
    onlineUsers.get(roomName)!.add(socket.userId);

    // Notify others in the room
    socket.to(roomName).emit("user:joined", {
      userId: socket.userId,
      user: socket.user,
    });

    // Send current online users to the joining user
    const usersInRoom = Array.from(onlineUsers.get(roomName) || []);
    socket.emit("room:users", { projectId, users: usersInRoom });
  });

  // User leaves a project room
  socket.on("leave:project", (projectId: string) => {
    const roomName = `project:${projectId}`;
    socket.leave(roomName);

    // Remove from online users
    onlineUsers.get(roomName)?.delete(socket.userId);

    // Notify others
    socket.to(roomName).emit("user:left", {
      userId: socket.userId,
    });
  });

  // Handle disconnect - clean up all rooms
  socket.on("disconnect", () => {
    // Remove user from all rooms they were in
    for (const [roomName, users] of onlineUsers.entries()) {
      if (users.has(socket.userId)) {
        users.delete(socket.userId);
        socket.to(roomName).emit("user:left", {
          userId: socket.userId,
        });
      }
    }
  });
};
```

---

## Step 6: Task Handlers
**File:** `src/sockets/handlers/taskHandlers.ts`

```typescript
import { Server } from "socket.io";
import { AuthenticatedSocket } from "../middleware/socketAuth";

export const registerTaskHandlers = (
  io: Server,
  socket: AuthenticatedSocket
) => {
  // Task created
  socket.on("task:create", (data: { projectId: string; task: any }) => {
    const roomName = `project:${data.projectId}`;
    
    // Broadcast to all users in the project room (except sender)
    socket.to(roomName).emit("task:created", {
      task: data.task,
      createdBy: socket.user,
    });
  });

  // Task updated (status, assignee, etc.)
  socket.on("task:update", (data: { projectId: string; taskId: string; updates: any }) => {
    const roomName = `project:${data.projectId}`;
    
    socket.to(roomName).emit("task:updated", {
      taskId: data.taskId,
      updates: data.updates,
      updatedBy: socket.user,
    });
  });

  // Task deleted
  socket.on("task:delete", (data: { projectId: string; taskId: string }) => {
    const roomName = `project:${data.projectId}`;
    
    socket.to(roomName).emit("task:deleted", {
      taskId: data.taskId,
      deletedBy: socket.user,
    });
  });

  // Task moved (Kanban drag-drop)
  socket.on("task:move", (data: { 
    projectId: string; 
    taskId: string; 
    fromStatus: string;
    toStatus: string;
    newIndex: number;
  }) => {
    const roomName = `project:${data.projectId}`;
    
    socket.to(roomName).emit("task:moved", {
      ...data,
      movedBy: socket.user,
    });
  });
};
```

---

## Step 7: Chat Handlers (Optional for now - Phase 5)
**File:** `src/sockets/handlers/chatHandlers.ts`

```typescript
import { Server } from "socket.io";
import { AuthenticatedSocket } from "../middleware/socketAuth";

export const registerChatHandlers = (
  io: Server,
  socket: AuthenticatedSocket
) => {
  // Join a chat channel
  socket.on("chat:join", (channelId: string) => {
    socket.join(`chat:${channelId}`);
  });

  // Leave a chat channel
  socket.on("chat:leave", (channelId: string) => {
    socket.leave(`chat:${channelId}`);
  });

  // Typing indicator
  socket.on("chat:typing", (data: { channelId: string; isTyping: boolean }) => {
    socket.to(`chat:${data.channelId}`).emit("chat:userTyping", {
      userId: socket.userId,
      user: socket.user,
      isTyping: data.isTyping,
    });
  });
};
```

---

## Step 8: Main Socket.io Server (NOW you can create this!)
**File:** `src/sockets/index.ts`

```typescript
import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createRedisClient } from "../config/redis";
import { socketAuthMiddleware } from "./middleware/socketAuth";
import { registerTaskHandlers } from "./handlers/taskHandlers";
import { registerChatHandlers } from "./handlers/chatHandlers";
import { registerPresenceHandlers } from "./handlers/presenceHandlers";

export const initializeSocket = async (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Setup Redis Adapter for horizontal scaling
  const pubClient = createRedisClient();
  const subClient = pubClient?.duplicate();

  if (pubClient && subClient) {
    await Promise.all([
      new Promise((resolve) => pubClient.on("ready", resolve)),
      new Promise((resolve) => subClient.on("ready", resolve)),
    ]);
    io.adapter(createAdapter(pubClient, subClient));
    console.log("Socket.io Redis adapter initialized");
  } else {
    console.log("Socket.io running without Redis adapter (single server mode)");
  }

  // Apply JWT authentication middleware
  io.use(socketAuthMiddleware);

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.user.name} (${socket.userId})`);

    // Register all event handlers
    registerPresenceHandlers(io, socket);
    registerTaskHandlers(io, socket);
    registerChatHandlers(io, socket);

    socket.on("disconnect", (reason) => {
      console.log(`User disconnected: ${socket.user.name} - ${reason}`);
    });
  });

  return io;
};
```

---

## Step 9: Update Server File
**File:** `src/server.ts` (or `src/app.ts`)

Add these imports and update initialization:

```typescript
import { initializeSocket } from "./sockets";
import taskRoutes from "./routes/task.routes";

// Register task routes
app.use("/api/tasks", taskRoutes);

// Change server startup to async
const startServer = async () => {
  try {
    await connectDB();
    
    // Initialize Socket.io with Redis adapter
    const io = await initializeSocket(httpServer);
    
    // Make io accessible in routes (optional)
    app.set("io", io);
    
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup error:", error);
    process.exit(1);
  }
};

startServer();
```

---

## ✅ Complete Order Summary:

1. ✅ Task Model
2. ✅ Task Controller
3. ✅ Task Routes
4. ✅ Socket Auth Middleware
5. ✅ Presence Handlers
6. ✅ Task Handlers
7. ✅ Chat Handlers
8. ✅ Main Socket Server (imports all above)
9. ✅ Update Server File

**Now follow this order and you won't get import errors!**
