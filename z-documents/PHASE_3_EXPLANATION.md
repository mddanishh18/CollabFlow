# Phase 3 Code Explanation
## Task Management + Real-Time Sync

> This document explains what each file in Phase 3 does and how they work together.

---

## Overview

Phase 3 adds task management with real-time synchronization across users. When one user creates, updates, or deletes a task, all other users viewing the same project see the change instantly.

---

## Backend Files (Create in order)

### 1. `src/config/redis.ts`

**What it does:**
- Creates a Redis client connection to Upstash
- Returns `null` if REDIS_URL is not set (graceful fallback)
- Logs connection status

**Key parts:**
```typescript
maxRetriesPerRequest: null  // Required for Socket.io adapter
enableReadyCheck: false     // Required for Upstash
```

**When it runs:** When server starts and Socket.io initializes

---

### 2. `src/models/Task.ts`

**What it does:**
- Defines the database schema for tasks
- Includes subtasks and labels as embedded arrays
- Sets up database indexes for faster queries

**Key fields:**
| Field | Type | Purpose |
|-------|------|---------|
| `title` | String (required) | Task name |
| `status` | Enum | "todo", "in-progress", "review", "done" |
| `priority` | Enum | "low", "medium", "high" |
| `assignee` | ObjectId | User assigned to task |
| `project` | ObjectId | Which project task belongs to |
| `subtasks` | Array | Checklist items with title + completed |
| `labels` | Array | Tags with name + color |

**Indexes:**
```typescript
TaskSchema.index({ project: 1, status: 1 });  // Fast queries by project & status
TaskSchema.index({ assignee: 1 });            // Fast queries by assignee
```

---

### 3. `src/controllers/taskController.ts`

**What it does:**
- Handles all HTTP requests for tasks
- Validates user has access to project before allowing task operations
- Populates related data (assignee, createdBy)

**5 Functions:**

#### `getProjectTasks()`
- Gets all tasks for a project
- Verifies user is project member
- Returns tasks sorted by newest first

#### `getTask()`
- Gets single task by ID
- Verifies user has access
- Populates assignee and creator info

#### `createTask()`
- Creates new task
- Auto-sets workspace from project
- Returns populated task

#### `updateTask()`
- Updates task fields (status, assignee, etc.)
- Verifies access first
- Returns updated task

#### `deleteTask()`
- Deletes task permanently
- Verifies access first
- Returns success message

**Security pattern:**
```typescript
// Every function does this:
const project = await Project.findOne({
  _id: projectId,
  "members.user": userId,  // Ensures user is a member
});

if (!project) {
  return res.status(403).json({ message: "Access denied" });
}
```

---

### 4. `src/routes/task.routes.ts`

**What it does:**
- Defines API endpoints for tasks
- Applies auth middleware to all routes
- Maps URLs to controller functions

**Routes:**
```
GET    /api/tasks/project/:projectId  → getProjectTasks
GET    /api/tasks/:taskId             → getTask
POST   /api/tasks                     → createTask
PATCH  /api/tasks/:taskId             → updateTask
DELETE /api/tasks/:taskId             → deleteTask
```

**Must register in `server.ts`:**
```typescript
import taskRoutes from "./routes/task.routes";
app.use("/api/tasks", taskRoutes);
```

---

### 5. `src/sockets/index.ts`

**What it does:**
- Creates Socket.io server
- Sets up Redis adapter for multi-server support
- Applies JWT authentication
- Registers event handlers

**Key flow:**
```typescript
1. Create Redis pub/sub clients
2. Wait for Redis to connect
3. Attach Redis adapter to Socket.io
4. Apply JWT auth middleware
5. On each connection → register handlers
```

**Why async?**
```typescript
export const initializeSocket = async (httpServer: HttpServer)
```
We need to `await` Redis connection before starting Socket.io.

---

### 6. `src/sockets/middleware/socketAuth.ts`

**What it does:**
- Verifies JWT token during WebSocket handshake
- Attaches user info to socket object
- Rejects connection if token invalid

**How client sends token:**
```typescript
// Frontend:
socket = io("http://localhost:5000", {
  auth: {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
});
```

**What middleware does:**
```typescript
1. Extract token from socket.handshake.auth.token
2. Verify with jwt.verify()
3. Attach decoded data to socket.user
4. Call next() to allow connection
5. OR call next(Error) to reject
```

---

### 7. `src/sockets/handlers/taskHandlers.ts`

**What it does:**
- Handles real-time task events
- Broadcasts updates to room (project)
- Only users in the same project receive events

**Events handled:**

#### `task:create`
Client emits when creating task → Server broadcasts `task:created` to room

#### `task:update`
Client emits when updating task → Server broadcasts `task:updated` to room

#### `task:delete`
Client emits when deleting task → Server broadcasts `task:deleted` to room

#### `task:move`
Client emits when dragging task (Kanban) → Server broadcasts `task:moved` to room

**Room logic:**
```typescript
const roomName = `project:${data.projectId}`;
socket.to(roomName).emit("task:created", { ... });
```
`socket.to(room)` = send to everyone in room EXCEPT sender

---

### 8. `src/sockets/handlers/presenceHandlers.ts`

**What it does:**
- Tracks who's online in each project
- Notifies when users join/leave
- Maintains online user list per room

**Events handled:**

#### `join:project`
- User joins project room
- Add userId to online users set
- Broadcast to others: "user:joined"
- Send current online users to joining user

#### `leave:project`
- User leaves project room
- Remove userId from online users
- Broadcast to others: "user:left"

#### `disconnect`
- Remove user from ALL rooms they were in
- Broadcast "user:left" to each room

**Data structure:**
```typescript
onlineUsers = Map {
  "project:123" => Set { "user-1", "user-2" },
  "project:456" => Set { "user-3" }
}
```

---

### 9. `src/server.ts` (Update existing)

**What to add:**
```typescript
import taskRoutes from "./routes/task.routes";
import { initializeSocket } from "./sockets";

// Register task routes
app.use("/api/tasks", taskRoutes);

// Change server startup to async
const startServer = async () => {
  await connectDB();
  const io = await initializeSocket(httpServer);  // Now async!
  app.set("io", io);
  
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer().catch(console.error);
```

---

## How It All Works Together

### Example: User Creates a Task

```
1. Frontend: POST /api/tasks
   ↓
2. taskController.createTask() 
   → Save to MongoDB
   → Return task
   ↓
3. Frontend receives task
   → Emit socket event: task:create
   ↓
4. taskHandlers.ts receives event
   → Broadcast to project room: task:created
   ↓
5. Other users in same project
   → Receive task:created event
   → Add task to their UI
   → See task appear instantly!
```

### Example: Redis Pub/Sub Flow

```
Server 1 (User A connected):
  socket.to("project:123").emit("task:created")
  ↓
  Publish to Redis: "task:created in project:123"

Redis:
  Broadcast to all subscribers

Server 2 (User B connected):
  ↓ Receives from Redis
  Forward to clients in "project:123"
  ↓
  User B sees task appear!
```

---

## Testing Checklist

- [ ] Server starts without errors
- [ ] Redis connects (or gracefully skips)
- [ ] Can create task via POST /api/tasks
- [ ] Can get tasks via GET /api/tasks/project/:id
- [ ] Socket.io connection succeeds with JWT
- [ ] Creating task emits real-time event
- [ ] Other users see task update instantly

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "REDIS_URL not set" | Optional - works without Redis locally |
| "Authentication required" | Check JWT token in socket handshake |
| "Task not found" | Verify projectId is correct |
| "Access denied" | User not a member of project |
| Updates not real-time | Check socket connection and room joining |
