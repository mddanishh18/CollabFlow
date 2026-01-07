# CollabFlow - Features & File Mapping
## Complete Guide: What Feature Lives Where

> **Purpose:** Quick reference to find which files handle each feature's logic

---

## 🔐 1. Authentication & User Management

### Feature: User Registration
**What it does:** Create new user accounts

**Backend Files:**
- `backend/src/models/User.js` - User schema definition
- `backend/src/controllers/authController.js` - `register()` function
- `backend/src/routes/auth.routes.js` - POST `/api/auth/register` route
- `backend/src/utils/bcrypt.js` - Password hashing logic

**Frontend Files:**
- `src/components/auth/register-form.jsx` - Registration form UI
- `src/app/(auth)/register/page.jsx` - Register page
- `src/store/auth-store.js` - Auth state management
- `src/lib/api.js` - API call: `POST /api/auth/register`

---

### Feature: User Login
**What it does:** Authenticate users and generate JWT tokens

**Backend Files:**
- `backend/src/controllers/authController.js` - `login()` function
- `backend/src/routes/auth.routes.js` - POST `/api/auth/login` route
- `backend/src/utils/jwt.js` - JWT token generation
- `backend/src/utils/bcrypt.js` - Password verification

**Frontend Files:**
- `src/components/auth/login-form.jsx` - Login form UI
- `src/app/(auth)/login/page.jsx` - Login page
- `src/store/auth-store.js` - Store user token & data
- `src/lib/api.js` - API call: `POST /api/auth/login`

---

### Feature: Protected Routes
**What it does:** Restrict access to authenticated users only

**Backend Files:**
- `backend/src/middleware/auth.middleware.js` - JWT verification middleware

**Frontend Files:**
- `src/app/(dashboard)/layout.jsx` - Check auth before rendering
- `src/store/auth-store.js` - Check if user is logged in
- `src/hooks/use-auth.js` - Custom hook for auth checks

---

## 🏢 2. Workspace Management

### Feature: Create Workspace
**What it does:** Create a new team workspace

**Backend Files:**
- `backend/src/models/Workspace.js` - Workspace schema
- `backend/src/controllers/workspaceController.js` - `createWorkspace()` function
- `backend/src/routes/workspace.routes.js` - POST `/api/workspaces` route

**Frontend Files:**
- `src/components/workspace/create-workspace-dialog.jsx` - Creation dialog (if created)
- `src/app/(dashboard)/workspace/[workspaceId]/page.jsx` - Workspace page
- `src/hooks/use-workspace.js` - Workspace CRUD hooks
- `src/store/workspace-store.js` - Workspace state

---

### Feature: Workspace Switcher
**What it does:** Switch between multiple workspaces

**Backend Files:**
- `backend/src/controllers/workspaceController.js` - `getUserWorkspaces()` function
- `backend/src/routes/workspace.routes.js` - GET `/api/workspaces` route

**Frontend Files:**
- `src/components/workspace/workspace-switcher.jsx` - **MAIN LOGIC** - Dropdown to switch workspaces
- `src/hooks/use-workspace.js` - Fetch user's workspaces
- `src/store/workspace-store.js` - Current workspace state

---

### Feature: Workspace Settings
**What it does:** Update workspace name, invite members, permissions

**Backend Files:**
- `backend/src/controllers/workspaceController.js` - `updateWorkspace()`, `inviteMember()` functions
- `backend/src/routes/workspace.routes.js` - PUT `/api/workspaces/:id`, POST `/api/workspaces/:id/invite`

**Frontend Files:**
- `src/components/workspace/workspace-settings.jsx` - **MAIN LOGIC** - Settings UI
- `src/app/(dashboard)/workspace/[workspaceId]/settings/page.jsx` - Settings page

---

## 📁 3. Project Management

### Feature: Create Project
**What it does:** Create new project within workspace

**Backend Files:**
- `backend/src/models/Project.js` - Project schema
- `backend/src/controllers/projectController.js` - `createProject()` function
- `backend/src/routes/project.routes.js` - POST `/api/projects` route

**Frontend Files:**
- `src/components/project/create-project-dialog.jsx` - **MAIN LOGIC** - Project creation dialog
- `src/hooks/use-projects.js` - Project CRUD hooks
- `src/app/(dashboard)/workspace/[workspaceId]/projects/page.jsx` - Projects list page

---

### Feature: Project List View
**What it does:** Display all projects in a workspace

**Backend Files:**
- `backend/src/controllers/projectController.js` - `getProjects()` function
- `backend/src/routes/project.routes.js` - GET `/api/workspaces/:workspaceId/projects` route

**Frontend Files:**
- `src/components/project/project-list.jsx` - **MAIN LOGIC** - List rendering
- `src/components/project/project-card.jsx` - Individual project card
- `src/app/(dashboard)/workspace/[workspaceId]/projects/page.jsx` - Page wrapper

---

### Feature: Project Settings
**What it does:** Update project details, archive/delete

**Backend Files:**
- `backend/src/controllers/projectController.js` - `updateProject()`, `deleteProject()` functions
- `backend/src/routes/project.routes.js` - PUT/DELETE `/api/projects/:id`

**Frontend Files:**
- `src/components/project/project-settings.jsx` - Settings UI (if created)
- `src/app/(dashboard)/workspace/[workspaceId]/projects/[projectId]/settings/page.jsx`

---

## ✅ 4. Task Management (CORE FEATURE)

### Feature: Create Task
**What it does:** Add new task to project

**Backend Files:**
- `backend/src/models/Task.js` - Task schema with all fields (title, description, assignee, priority, etc.)
- `backend/src/controllers/taskController.js` - `createTask()` function
- `backend/src/routes/task.routes.js` - POST `/api/tasks` route

**Frontend Files:**
- `src/components/task/create-task-dialog.jsx` - **MAIN LOGIC** - Task creation form
- `src/hooks/use-tasks.js` - Task CRUD hooks
- `src/lib/yjs.js` - CRDT sync for real-time task creation

---

### Feature: Task List View
**What it does:** Display tasks in a list

**Backend Files:**
- `backend/src/controllers/taskController.js` - `getTasks()` function
- `backend/src/routes/task.routes.js` - GET `/api/projects/:projectId/tasks` route

**Frontend Files:**
- `src/components/task/task-list.jsx` - **MAIN LOGIC** - List rendering
- `src/components/task/task-card.jsx` - Individual task card
- `src/app/(dashboard)/workspace/[workspaceId]/projects/[projectId]/page.jsx` - Default view

---

### Feature: Task Details
**What it does:** View and edit task details, add comments

**Backend Files:**
- `backend/src/controllers/taskController.js` - `getTaskById()`, `updateTask()` functions
- `backend/src/routes/task.routes.js` - GET/PUT `/api/tasks/:id`

**Frontend Files:**
- `src/components/task/task-detail.jsx` - **MAIN LOGIC** - Full task details view
- `src/components/task/task-assignee.jsx` - Assignee selector
- `src/components/task/task-priority-badge.jsx` - Priority indicator
- `src/components/task/comment-section.jsx` - Comments UI

---

### Feature: Assign Task
**What it does:** Assign task to team member

**Backend Files:**
- `backend/src/controllers/taskController.js` - `updateTask()` function (updates assignee field)
- `backend/src/models/Task.js` - `assignee` field

**Frontend Files:**
- `src/components/task/task-assignee.jsx` - **MAIN LOGIC** - Assignee dropdown
- `src/components/task/task-detail.jsx` - Contains assignee component

---

### Feature: Task Priority
**What it does:** Set task priority (High/Medium/Low)

**Backend Files:**
- `backend/src/models/Task.js` - `priority` field (enum: 'low', 'medium', 'high')
- `backend/src/controllers/taskController.js` - `updateTask()` function

**Frontend Files:**
- `src/components/task/task-priority-badge.jsx` - **MAIN LOGIC** - Priority selector/badge
- `src/components/task/task-detail.jsx` - Contains priority selector

---

## ⚡ 5. Real-Time Collaboration

### Feature: Live Cursor Tracking
**What it does:** Show where other users are clicking/typing

**Backend Files:**
- `backend/src/sockets/index.js` - Socket.io server setup
- `backend/src/sockets/handlers/presenceHandlers.js` - **MAIN LOGIC** - `handleCursorMove()` event

**Frontend Files:**
- `src/components/realtime/cursor-presence.jsx` - **MAIN LOGIC** - Render other users' cursors
- `src/lib/socket.js` - Socket.io client connection
- `src/hooks/use-socket.js` - Socket connection hook

---

### Feature: User Presence (Online/Offline)
**What it does:** Show who's currently online in workspace

**Backend Files:**
- `backend/src/sockets/handlers/presenceHandlers.js` - **MAIN LOGIC** - `handleUserJoin()`, `handleUserLeave()` events
- `backend/src/sockets/index.js` - Socket connection/disconnection events

**Frontend Files:**
- `src/components/realtime/user-avatar-stack.jsx` - **MAIN LOGIC** - Display online users
- `src/hooks/use-realtime.js` - Real-time presence hook
- `src/lib/socket.js` - Emit join/leave events

---

### Feature: Real-Time Task Updates
**What it does:** Instantly sync task changes across all users

**Backend Files:**
- `backend/src/sockets/handlers/taskHandlers.js` - **MAIN LOGIC** - `handleTaskUpdate()`, `handleTaskCreate()` events
- `backend/src/models/Task.js` - Task data structure

**Frontend Files:**
- `src/lib/yjs.js` - **MAIN LOGIC** - CRDT implementation for conflict-free sync
- `src/hooks/use-realtime.js` - Real-time sync hook
- `src/lib/socket.js` - Socket events for tasks

---

### Feature: Typing Indicators
**What it does:** Show "User is typing..." in comments

**Backend Files:**
- `backend/src/sockets/handlers/taskHandlers.js` - `handleTyping()` event

**Frontend Files:**
- `src/components/realtime/typing-indicator.jsx` - **MAIN LOGIC** - Display typing status
- `src/components/task/comment-section.jsx` - Emit typing events

---

## 📊 6. Multiple Views

### Feature: Kanban Board View
**What it does:** Drag-and-drop task cards across columns

**Backend Files:**
- `backend/src/controllers/taskController.js` - `updateTask()` to change status/column
- `backend/src/models/Project.js` - Column definitions

**Frontend Files:**
- `src/components/board/kanban-board.jsx` - **MAIN LOGIC** - Board container with drag-drop logic
- `src/components/board/kanban-column.jsx` - Individual column (Todo, In Progress, Done)
- `src/components/board/kanban-card.jsx` - Draggable task card
- `src/app/(dashboard)/workspace/[workspaceId]/projects/[projectId]/board/page.jsx` - Board page
- Uses: `@dnd-kit` library for drag-and-drop

---

### Feature: Calendar View
**What it does:** Display tasks by due date

**Backend Files:**
- `backend/src/controllers/taskController.js` - `getTasks()` with date filtering

**Frontend Files:**
- `src/components/calendar/calendar-view.jsx` - **MAIN LOGIC** - Calendar component
- `src/app/(dashboard)/workspace/[workspaceId]/projects/[projectId]/calendar/page.jsx` - Calendar page
- Uses: `react-big-calendar` library

---

### Feature: Timeline/Gantt Chart View
**What it does:** Show project timeline with dependencies

**Backend Files:**
- `backend/src/controllers/taskController.js` - `getTasks()` with dependencies
- `backend/src/models/Task.js` - `dependencies` field (array of task IDs)

**Frontend Files:**
- `src/components/timeline/gantt-chart.jsx` - **MAIN LOGIC** - Timeline visualization
- `src/app/(dashboard)/workspace/[workspaceId]/projects/[projectId]/timeline/page.jsx` - Timeline page

---

## 🤖 7. AI Features

### Feature: AI Task Breakdown
**What it does:** Split large task into subtasks using AI

**Backend Files:**
- `backend/src/services/aiService.js` - **MAIN LOGIC** - `generateSubtasks()` function using OpenAI API
- `backend/src/controllers/aiController.js` - `breakdownTask()` endpoint
- `backend/src/routes/ai.routes.js` - POST `/api/ai/breakdown` route

**Frontend Files:**
- `src/components/ai/ai-task-breakdown.jsx` - **MAIN LOGIC** - Task breakdown UI
- `src/hooks/use-ai.js` - AI API calls
- `src/components/task/task-detail.jsx` - Contains AI breakdown button

**API Integration:**
- OpenAI GPT-4 API
- Prompt engineering in `aiService.js`

---

### Feature: AI Summarization
**What it does:** Summarize long discussions/comments

**Backend Files:**
- `backend/src/services/aiService.js` - **MAIN LOGIC** - `summarizeDiscussion()` function
- `backend/src/controllers/aiController.js` - `summarize()` endpoint
- `backend/src/routes/ai.routes.js` - POST `/api/ai/summarize`

**Frontend Files:**
- `src/components/ai/ai-summarize.jsx` - **MAIN LOGIC** - Summary display UI
- `src/components/task/task-detail.jsx` - Contains "Summarize" button

---

### Feature: AI Prioritization
**What it does:** AI suggests task priority and order

**Backend Files:**
- `backend/src/services/aiService.js` - **MAIN LOGIC** - `prioritizeTasks()` function
- `backend/src/controllers/aiController.js` - `prioritize()` endpoint
- `backend/src/routes/ai.routes.js` - POST `/api/ai/prioritize`

**Frontend Files:**
- `src/components/ai/ai-chat.jsx` - AI suggestions UI
- `src/hooks/use-ai.js` - Prioritization API call

---

### Feature: AI Chat Assistant
**What it does:** Chat with AI about project/tasks

**Backend Files:**
- `backend/src/services/aiService.js` - **MAIN LOGIC** - `chatCompletion()` function
- `backend/src/controllers/aiController.js` - `chat()` endpoint
- `backend/src/routes/ai.routes.js` - POST `/api/ai/chat`

**Frontend Files:**
- `src/components/ai/ai-chat.jsx` - **MAIN LOGIC** - Chat interface
- `src/hooks/use-ai.js` - Chat API integration

---

## 💬 8. Comments & Notifications

### Feature: Task Comments
**What it does:** Add comments to tasks

**Backend Files:**
- `backend/src/models/Comment.js` - Comment schema
- `backend/src/controllers/commentController.js` - **MAIN LOGIC** - `createComment()`, `getComments()` functions
- `backend/src/routes/comment.routes.js` - POST/GET `/api/tasks/:taskId/comments`

**Frontend Files:**
- `src/components/task/comment-section.jsx` - **MAIN LOGIC** - Comment list + input
- `src/components/task/task-detail.jsx` - Contains comment section

---

### Feature: @Mentions
**What it does:** Mention users in comments to notify them

**Backend Files:**
- `backend/src/controllers/commentController.js` - Parse mentions from comment text
- `backend/src/services/notificationService.js` - Create notification for mentioned users
- `backend/src/models/Comment.js` - `mentions` field (array of user IDs)

**Frontend Files:**
- `src/components/task/comment-section.jsx` - **MAIN LOGIC** - Detect @ symbol, show user dropdown

---

### Feature: Notifications
**What it does:** Notify users of mentions, assignments, deadlines

**Backend Files:**
- `backend/src/models/Notification.js` - Notification schema
- `backend/src/services/notificationService.js` - **MAIN LOGIC** - `createNotification()` function
- `backend/src/controllers/notificationController.js` - Get/mark as read

**Frontend Files:**
- `src/components/shared/notification-dropdown.jsx` - **MAIN LOGIC** - Notification bell + dropdown
- `src/components/shared/navbar.jsx` - Contains notification dropdown

---

## 🎨 9. Interactive Canvas/Whiteboard

### Feature: Collaborative Whiteboard
**What it does:** Draw, add sticky notes, shapes in real-time

**Backend Files:**
- `backend/src/sockets/handlers/canvasHandlers.js` - **MAIN LOGIC** - Handle canvas drawing events
- `backend/src/models/Canvas.js` - Store canvas state (if persisting)

**Frontend Files:**
- `src/components/canvas/whiteboard.jsx` - **MAIN LOGIC** - Canvas rendering with Fabric.js/Konva
- `src/components/canvas/sticky-note.jsx` - Sticky note component
- `src/components/canvas/drawing-tools.jsx` - Drawing toolbar
- `src/app/(dashboard)/workspace/[workspaceId]/projects/[projectId]/canvas/page.jsx` - Canvas page
- Uses: `fabric.js` or `react-konva` library

---

### Feature: Sticky Notes
**What it does:** Add colored sticky notes to canvas

**Frontend Files:**
- `src/components/canvas/sticky-note.jsx` - **MAIN LOGIC** - Sticky note rendering + editing
- `src/components/canvas/whiteboard.jsx` - Contains sticky notes

---

### Feature: Canvas → Tasks Conversion (Future)
**What it does:** Convert whiteboard ideas into tasks

**Backend Files:**
- `backend/src/services/aiService.js` - Parse canvas content with AI
- `backend/src/controllers/aiController.js` - `convertCanvasToTasks()` endpoint

**Frontend Files:**
- `src/components/canvas/whiteboard.jsx` - "Convert to Tasks" button

---

## 🔍 10. Search & Filtering

### Feature: Global Search
**What it does:** Search across all tasks, projects, comments

**Backend Files:**
- `backend/src/controllers/searchController.js` - `globalSearch()` function (if created)
- Uses MongoDB text search or separate search service

**Frontend Files:**
- `src/components/shared/search-bar.jsx` - Search input (if created)
- `src/components/shared/navbar.jsx` - Contains search bar

---

### Feature: Task Filtering
**What it does:** Filter tasks by assignee, status, priority, tags

**Backend Files:**
- `backend/src/controllers/taskController.js` - `getTasks()` with query parameters

**Frontend Files:**
- `src/components/task/task-filters.jsx` - Filter UI (if created)
- `src/components/task/task-list.jsx` - Apply filters to list

---

## 🎨 11. UI/UX Components

### Feature: Sidebar Navigation
**What it does:** Navigate between projects, views

**Frontend Files:**
- `src/components/workspace/sidebar.jsx` - **MAIN LOGIC** - Sidebar with project list
- `src/app/(dashboard)/layout.jsx` - Contains sidebar

---

### Feature: Navbar
**What it does:** Top navigation with workspace switcher, notifications, user menu

**Frontend Files:**
- `src/components/shared/navbar.jsx` - **MAIN LOGIC** - Top navigation bar
- `src/components/workspace/workspace-switcher.jsx` - Workspace dropdown
- `src/components/shared/notification-dropdown.jsx` - Notifications

---

### Feature: Loading States
**What it does:** Show spinners during data fetching

**Frontend Files:**
- `src/components/shared/loading-spinner.jsx` - **MAIN LOGIC** - Reusable spinner component
- Used in all pages during loading

---

### Feature: Error Handling
**What it does:** Display error messages gracefully

**Frontend Files:**
- `src/components/shared/error-boundary.jsx` - **MAIN LOGIC** - React error boundary
- `src/app/not-found.jsx` - 404 page

---

## 🔐 12. Security & Middleware

### Feature: JWT Authentication
**What it does:** Verify user identity on API requests

**Backend Files:**
- `backend/src/middleware/auth.middleware.js` - **MAIN LOGIC** - JWT verification
- `backend/src/utils/jwt.js` - Token generation/verification functions
- Applied to all protected routes

---

### Feature: Input Validation
**What it does:** Validate API request data

**Backend Files:**
- `backend/src/middleware/validation.middleware.js` - **MAIN LOGIC** - Zod schema validation
- Applied to POST/PUT routes

---

### Feature: Rate Limiting
**What it does:** Prevent API abuse

**Backend Files:**
- `backend/src/middleware/rateLimit.middleware.js` - **MAIN LOGIC** - Rate limiting logic
- Uses `express-rate-limit` package

---

### Feature: Error Handling
**What it does:** Centralized error responses

**Backend Files:**
- `backend/src/middleware/error.middleware.js` - **MAIN LOGIC** - Global error handler
- Applied at end of Express middleware chain

---

## 🗄️ 13. Database & Config

### Feature: MongoDB Connection
**What it does:** Connect to MongoDB database

**Backend Files:**
- `backend/src/config/db.js` - **MAIN LOGIC** - Mongoose connection setup
- `backend/src/server.js` - Call connection on startup

---

### Feature: Redis Caching
**What it does:** Cache frequently accessed data

**Backend Files:**
- `backend/src/config/redis.js` - **MAIN LOGIC** - Redis client setup
- Used in controllers for caching

---

### Feature: Environment Variables
**What it does:** Manage secrets and config

**Backend Files:**
- `backend/src/config/env.js` - **MAIN LOGIC** - Load and validate env vars
- `backend/.env` - Actual environment variables

**Frontend Files:**
- `collaboration-platform/.env.local` - Frontend env vars
- Next.js automatically loads these

---

## 📦 14. File Upload (Future)

### Feature: Task Attachments
**What it does:** Upload files to tasks

**Backend Files:**
- `backend/src/services/uploadService.js` - **MAIN LOGIC** - S3/R2 upload logic
- `backend/src/controllers/taskController.js` - Handle attachment metadata
- Uses `multer` for file uploads

**Frontend Files:**
- `src/components/task/task-detail.jsx` - File upload input

---

## 🎯 Quick Reference: Where to Find Key Logic

| Feature | Primary File |
|---------|-------------|
| User registration | `backend/src/controllers/authController.js` |
| Login | `backend/src/controllers/authController.js` |
| Create task | `backend/src/controllers/taskController.js` |
| Real-time sync | `src/lib/yjs.js` |
| WebSocket events | `backend/src/sockets/index.js` |
| Kanban board | `src/components/board/kanban-board.jsx` |
| AI features | `backend/src/services/aiService.js` |
| Comments | `backend/src/controllers/commentController.js` |
| Whiteboard | `src/components/canvas/whiteboard.jsx` |
| Database models | `backend/src/models/` folder |
| UI components | `src/components/ui/` folder (Shadcn) |

---

## 📝 How to Use This Document

**When adding a new feature:**
1. Find similar feature in this doc
2. Copy file structure
3. Update relevant files
4. Add new entry to this document

**When debugging:**
1. Find feature in this doc
2. Check all listed files
3. Start with files marked **MAIN LOGIC**

**When explaining to team:**
- Show this doc
- They can quickly find what they need

---

*This document will be updated as new features are added during development.*
