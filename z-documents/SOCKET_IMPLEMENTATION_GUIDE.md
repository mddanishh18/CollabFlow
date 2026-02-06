# Socket.io Implementation Guide for CollabFlow

> Based on 2025-2026 best practices research. This guide covers everything you need to implement real-time features.

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                      │
├─────────────────────────────────────────────────────────────┤
│  socket.ts (client)  →  useSocket.ts hook  →  Components   │
└──────────────────────────────┬──────────────────────────────┘
                               │ WebSocket Connection
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend (Express + Socket.io)             │
├─────────────────────────────────────────────────────────────┤
│  sockets/index.ts                                           │
│    ├── middleware/socketAuth.ts  (JWT verification)         │
│    └── handlers/                                            │
│        ├── taskHandlers.ts       (task events)              │
│        ├── chatHandlers.ts       (chat events)              │
│        └── presenceHandlers.ts   (online status)            │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Backend Implementation

### 2.1 Install Dependencies

```bash
cd backend
npm install socket.io ioredis @socket.io/redis-adapter
npm install -D @types/socket.io
```

### 2.2 Redis Configuration (Upstash)

**Step 1: Create Upstash Redis Database**
1. Go to [upstash.com](https://upstash.com) and sign up (free)
2. Create a new Redis database
3. Copy the connection string (starts with `rediss://`)

**Step 2: Add to Environment Variables**

**File: `backend/.env`**
```env
# Upstash Redis
REDIS_URL=rediss://default:YOUR_PASSWORD@YOUR_ENDPOINT.upstash.io:6379
```

**Step 3: Create Redis Config**

**File: `src/config/redis.ts`**

```typescript
import Redis from "ioredis";

// Upstash Redis connection
export const createRedisClient = () => {
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    console.warn("REDIS_URL not set. Running without Redis adapter.");
    return null;
  }

  const client = new Redis(redisUrl, {
    maxRetriesPerRequest: null, // Required for Socket.io adapter
    enableReadyCheck: false,
  });

  client.on("error", (err) => {
    console.error("Redis connection error:", err);
  });

  client.on("connect", () => {
    console.log("Connected to Redis (Upstash)");
  });

  return client;
};
```

### 2.3 Socket.io Server Setup (with Redis Adapter)

**File: `src/sockets/index.ts`**

```typescript
import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createRedisClient } from "../config/redis";
import { socketAuthMiddleware } from "./middleware/socketAuth";
import { registerTaskHandlers } from "./handlers/taskHandlers";
import { registerChatHandlers } from "./handlers/chatHandlers";
import { registerPresenceHandlers } from "./handlers/presenceHandlers";

// Extend Socket type to include user data
export interface AuthenticatedSocket extends Socket {
  userId: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
}

// Track online users per room
export const onlineUsers = new Map<string, Set<string>>();

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

  io.on("connection", (socket: AuthenticatedSocket) => {
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

### 2.4 Task Model

**File: `src/models/Task.ts`**

```typescript
import mongoose, { Document, Schema } from "mongoose";

export interface ISubtask {
  title: string;
  completed: boolean;
}

export interface ILabel {
  name: string;
  color: string; // hex color
}

export interface ITask extends Document {
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "review" | "done";
  priority: "low" | "medium" | "high";
  assignee?: mongoose.Types.ObjectId;
  project: mongoose.Types.ObjectId;
  workspace: mongoose.Types.ObjectId;
  dueDate?: Date;
  subtasks: ISubtask[];
  labels: ILabel[];
  createdBy: mongoose.Types.ObjectId;
  updatedAt: Date;
  createdAt: Date;
}

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
        color: { type: String, required: true }, // e.g., "#FF5733"
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

### 2.5 Task Controller

**File: `src/controllers/taskController.ts`**

```typescript
import { Request, Response } from "express";
import Task from "../models/Task";
import Project from "../models/Project";

// Get all tasks for a project
export const getProjectTasks = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const userId = (req as any).user.userId;

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
export const getTask = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const userId = (req as any).user.userId;

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
export const createTask = async (req: Request, res: Response) => {
  try {
    const { title, description, status, priority, assignee, projectId, dueDate, labels } = req.body;
    const userId = (req as any).user.userId;

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
export const updateTask = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const updates = req.body;
    const userId = (req as any).user.userId;

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
export const deleteTask = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const userId = (req as any).user.userId;

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

### 2.6 Task Routes

**File: `src/routes/task.routes.ts`**

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

### 2.7 JWT Authentication Middleware

**File: `src/sockets/middleware/socketAuth.ts`**

```typescript
import { Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { AuthenticatedSocket } from "../index";

interface JwtPayload {
  userId: string;
  name: string;
  email: string;
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

### 2.4 Room-Based Architecture

**Key Concept:** Each project = separate room. Users only receive updates for projects they're viewing.

```typescript
// Room naming convention
const getRoomName = {
  project: (projectId: string) => `project:${projectId}`,
  workspace: (workspaceId: string) => `workspace:${workspaceId}`,
  chat: (channelId: string) => `chat:${channelId}`,
};
```

### 2.5 Presence Handler (User Online/Offline)

**File: `src/sockets/handlers/presenceHandlers.ts`**

```typescript
import { Server } from "socket.io";
import { AuthenticatedSocket, onlineUsers } from "../index";

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

### 2.6 Task Handler (Real-time Task Updates)

**File: `src/sockets/handlers/taskHandlers.ts`**

```typescript
import { Server } from "socket.io";
import { AuthenticatedSocket } from "../index";

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

### 2.7 Chat Handler

**File: `src/sockets/handlers/chatHandlers.ts`**

```typescript
import { Server } from "socket.io";
import { AuthenticatedSocket } from "../index";
import Message from "../../models/Message";

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

  // Send message
  socket.on("chat:message", async (data: { 
    channelId: string; 
    content: string;
  }) => {
    // Save to database
    const message = await Message.create({
      channel: data.channelId,
      sender: socket.userId,
      content: data.content,
    });

    // Populate sender info
    await message.populate("sender", "name email avatar");

    // Broadcast to channel
    io.to(`chat:${data.channelId}`).emit("chat:newMessage", message);
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

### 2.9 Integrate with Express Server

**File: `src/server.ts`**

```typescript
import express from "express";
import { createServer } from "http";
import { initializeSocket } from "./sockets";
import { connectDB } from "./config/db";

const app = express();
const httpServer = createServer(app);

// ... rest of your middleware and routes

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Connect to MongoDB
  await connectDB();

  // Initialize Socket.io with Redis adapter
  const io = await initializeSocket(httpServer);

  // Make io accessible in routes (optional)
  app.set("io", io);

  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer().catch(console.error);
```

---

## 3. Frontend Implementation

### 3.1 Install Dependencies

```bash
cd frontend
npm install socket.io-client
```

### 3.2 Socket Client Setup

**File: `src/lib/socket.ts`**

```typescript
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/auth-store";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    const token = useAuthStore.getState().token;
    
    socket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000", {
      auth: {
        token,
      },
      autoConnect: false,
    });
  }
  return socket;
};

export const connectSocket = () => {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
  }
  return s;
};

export const disconnectSocket = () => {
  if (socket?.connected) {
    socket.disconnect();
  }
};

// Reset socket (on logout)
export const resetSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
```

### 3.3 useSocket Hook

**File: `src/hooks/use-socket.ts`**

```typescript
import { useEffect, useCallback } from "react";
import { getSocket, connectSocket, disconnectSocket } from "@/lib/socket";
import { useAuthStore } from "@/store/auth-store";

export const useSocket = () => {
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      connectSocket();
    }

    return () => {
      // Don't disconnect on unmount - keep connection alive
    };
  }, [isAuthenticated]);

  const emit = useCallback((event: string, data?: any) => {
    const socket = getSocket();
    if (socket.connected) {
      socket.emit(event, data);
    }
  }, []);

  const on = useCallback((event: string, callback: (...args: any[]) => void) => {
    const socket = getSocket();
    socket.on(event, callback);
    
    // Return cleanup function
    return () => {
      socket.off(event, callback);
    };
  }, []);

  const joinProject = useCallback((projectId: string) => {
    emit("join:project", projectId);
  }, [emit]);

  const leaveProject = useCallback((projectId: string) => {
    emit("leave:project", projectId);
  }, [emit]);

  return {
    emit,
    on,
    joinProject,
    leaveProject,
    socket: getSocket(),
  };
};
```

### 3.4 Using in Components

**Example: Project Page with Real-time Tasks**

```tsx
// src/app/(dashboard)/workspace/[workspaceId]/projects/[projectId]/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useSocket } from "@/hooks/use-socket";
import { useTasks } from "@/hooks/use-tasks";

export default function ProjectPage({ params }: { params: { projectId: string } }) {
  const { projectId } = params;
  const { joinProject, leaveProject, on } = useSocket();
  const { tasks, addTask, updateTask, removeTask } = useTasks(projectId);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    // Join project room when page loads
    joinProject(projectId);

    // Listen for real-time events
    const unsubCreate = on("task:created", ({ task }) => {
      addTask(task);
    });

    const unsubUpdate = on("task:updated", ({ taskId, updates }) => {
      updateTask(taskId, updates);
    });

    const unsubDelete = on("task:deleted", ({ taskId }) => {
      removeTask(taskId);
    });

    const unsubUsers = on("room:users", ({ users }) => {
      setOnlineUsers(users);
    });

    const unsubJoin = on("user:joined", ({ userId }) => {
      setOnlineUsers(prev => [...prev, userId]);
    });

    const unsubLeave = on("user:left", ({ userId }) => {
      setOnlineUsers(prev => prev.filter(id => id !== userId));
    });

    // Cleanup on unmount
    return () => {
      leaveProject(projectId);
      unsubCreate();
      unsubUpdate();
      unsubDelete();
      unsubUsers();
      unsubJoin();
      unsubLeave();
    };
  }, [projectId]);

  return (
    <div>
      <div>Online: {onlineUsers.length} users</div>
      {/* Task list */}
    </div>
  );
}
```

---

## 4. Event Reference

### Task Events

| Event | Direction | Payload |
|-------|-----------|---------|
| `task:create` | Client → Server | `{ projectId, task }` |
| `task:created` | Server → Clients | `{ task, createdBy }` |
| `task:update` | Client → Server | `{ projectId, taskId, updates }` |
| `task:updated` | Server → Clients | `{ taskId, updates, updatedBy }` |
| `task:delete` | Client → Server | `{ projectId, taskId }` |
| `task:deleted` | Server → Clients | `{ taskId, deletedBy }` |
| `task:move` | Client → Server | `{ projectId, taskId, fromStatus, toStatus }` |
| `task:moved` | Server → Clients | `{ taskId, fromStatus, toStatus, movedBy }` |

### Presence Events

| Event | Direction | Payload |
|-------|-----------|---------|
| `join:project` | Client → Server | `projectId` |
| `leave:project` | Client → Server | `projectId` |
| `room:users` | Server → Client | `{ projectId, users[] }` |
| `user:joined` | Server → Clients | `{ userId, user }` |
| `user:left` | Server → Clients | `{ userId }` |

### Chat Events

| Event | Direction | Payload |
|-------|-----------|---------|
| `chat:join` | Client → Server | `channelId` |
| `chat:message` | Client → Server | `{ channelId, content }` |
| `chat:newMessage` | Server → Clients | `Message object` |
| `chat:typing` | Client → Server | `{ channelId, isTyping }` |
| `chat:userTyping` | Server → Clients | `{ userId, isTyping }` |

---

## 5. Redis Pub/Sub Architecture

### Why Redis for Socket.io?

```
WITHOUT Redis (Single Server Only):
┌─────────────────────────────────────┐
│          Node.js Server             │
│   User A ←──── Socket.io ────→      │
│   User B ←──── Socket.io ────→      │
│            All works! ✅            │
└─────────────────────────────────────┘

WITH Multiple Servers (Problem!):
┌─────────────────┐     ┌─────────────────┐
│   Server 1      │     │   Server 2      │
│   User A        │     │   User B        │
└─────────────────┘     └─────────────────┘
        ↑                       ↑
        └───── Can't sync! ❌ ───┘

WITH Redis Adapter (Solution!):
┌─────────────────┐     ┌─────────────────┐
│   Server 1      │     │   Server 2      │
│   User A        │     │   User B        │
└────────┬────────┘     └────────┬────────┘
         │      ┌───────────┐    │
         └──────│   Redis   │────┘
                │  Pub/Sub  │
                └───────────┘
                Events synced! ✅
```

### How It Works

1. **Pub (Publish):** When Server 1 emits to a room, it publishes to Redis
2. **Sub (Subscribe):** Server 2 is subscribed to Redis and receives the event
3. **Forward:** Server 2 forwards the event to its connected clients

### Upstash Free Tier

| Feature | Limit |
|---------|-------|
| Commands | 10,000/day |
| Storage | 256 MB |
| Connections | Unlimited |
| Cost | **$0** |

More than enough for development and small-scale production.

---

## 6. Best Practices Checklist

- [ ] Always verify JWT on socket connection
- [ ] Use rooms for project-specific updates
- [ ] Clean up listeners on component unmount
- [ ] Handle reconnection gracefully
- [ ] Emit to room, not broadcast to all
- [ ] Store user data in socket object after auth
- [ ] Use TypeScript interfaces for all events
- [ ] Use Redis adapter for production scaling
- [ ] Use `rediss://` (TLS) for Upstash connections
- [ ] Handle Redis connection errors gracefully
