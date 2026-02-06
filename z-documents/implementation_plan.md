# Product Requirements Document (PRD)
## Real-Time Collaboration Platform

> **Project Name:** CollabFlow  
> **Tech Stack:** Next.js 16, TypeScript, Tailwind CSS, Shadcn UI, Express.js, MongoDB, Socket.io  
> **Target:** Portfolio Project → Job Ready

---

## 1. Executive Summary

**What:** A real-time project management and collaboration platform with RAG-powered AI features.

**Target Users:** Remote teams (5-50 people), project managers, developers

**Key Differentiators:**
- Real-time collaboration using WebSockets (Socket.io)
- Team chat with channels
- RAG-powered knowledge base chatbot per project
- Time tracking and analytics dashboard
- Kanban board with drag-and-drop

---

## 2. Tech Stack (2026)

### Frontend
```
Framework: Next.js 16 (App Router)
Language: TypeScript
Styling: Tailwind CSS v4
UI Components: Shadcn UI
State Management: Zustand
Real-Time: Socket.io-client
Forms: React Hook Form + Zod
Drag & Drop: dnd-kit
Charts: Recharts
```

### Backend
```
Runtime: Node.js 20+
Framework: Express.js 5
Language: TypeScript
Real-Time: Socket.io 4.7+
Database: MongoDB 7+ (Mongoose ODM)
Authentication: JWT + bcrypt
Validation: Zod
AI: OpenAI API + Pinecone (Vector DB)
```

---

## 3. Phase-by-Phase Implementation

### **PHASE 1: Setup & Foundation** ✅ DONE
- Express + MongoDB backend
- Next.js frontend with TypeScript
- JWT Authentication (register/login)
- Zustand auth store with hydration

---

### **PHASE 2: Workspace & Project Management** ✅ DONE
- Workspace CRUD with member management
- Project CRUD within workspaces
- Role-based permissions (owner/admin/member/viewer)
- Sidebar navigation and workspace switcher

---

### **PHASE 3: Task Management + Real-Time Sync**
**Goal:** Tasks with subtasks, labels, Socket.io real-time sync, and Redis Pub/Sub

**Dependencies:**
```bash
# Backend
npm install socket.io ioredis @socket.io/redis-adapter
npm install -D @types/ioredis

# Frontend
npm install socket.io-client
npx shadcn@latest add badge select textarea popover calendar
```

**Environment Variables (.env):**
```env
# Upstash Redis (get from upstash.com dashboard)
REDIS_URL=rediss://default:YOUR_PASSWORD@YOUR_ENDPOINT.upstash.io:6379
```

**Task Model Features:**
- Title, description, status, priority
- Assignee (user reference)
- Due date
- **Subtasks** (array of { title, completed })
- **Labels/Tags** (array of { name, color })

**Files to Create:**

**Backend:**
1. `src/config/redis.ts` - Redis client setup with Upstash
2. `src/models/Task.ts` - Task schema with subtasks & labels
3. `src/controllers/taskController.ts` - Task CRUD
4. `src/routes/task.routes.ts` - Task routes
5. `src/sockets/index.ts` - Socket.io server with Redis adapter
6. `src/sockets/middleware/socketAuth.ts` - Socket JWT auth
7. `src/sockets/handlers/taskHandlers.ts` - Task real-time events
7. `src/sockets/handlers/presenceHandlers.ts` - User presence

**Frontend:**
8. `src/lib/socket.ts` - Socket.io client
9. `src/hooks/use-socket.ts` - Socket connection hook
10. `src/hooks/use-tasks.ts` - Task management hook
11. `src/components/task/task-card.tsx` - Task card with labels
12. `src/components/task/task-list.tsx` - Task list
13. `src/components/task/task-detail.tsx` - Task detail with subtasks
14. `src/components/task/create-task-dialog.tsx` - Create task
15. `src/components/task/subtask-list.tsx` - Subtask checklist
16. `src/components/task/label-picker.tsx` - Label selector
17. `src/components/realtime/user-presence.tsx` - Online users

---

### **PHASE 4: Multiple Views**
**Goal:** Kanban board and Calendar view

**Dependencies:**
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install react-big-calendar date-fns
```

**Files to Create:**
1. `src/components/board/kanban-board.tsx` - Main Kanban
2. `src/components/board/kanban-column.tsx` - Columns
3. `src/components/board/kanban-card.tsx` - Draggable cards with labels
4. `src/app/.../[projectId]/board/page.tsx` - Board page
5. `src/components/calendar/calendar-view.tsx` - Calendar
6. `src/app/.../[projectId]/calendar/page.tsx` - Calendar page

---

### **PHASE 5: Team Chat** ← NEW
**Goal:** Real-time chat channels within workspaces

**Backend:**
1. `src/models/Message.ts` - Message schema
2. `src/models/Channel.ts` - Channel schema (general, project-specific)
3. `src/controllers/chatController.ts` - Chat CRUD ✅
4. `src/routes/chat.routes.ts` - Chat routes ✅
5. `src/handlers/chatHandlers.ts` - Chat real-time events ✅

**Frontend:**
6. `src/store/chat-store.ts` - Zustand store for channels, messages, typing users
7. `src/hooks/use-chat.ts` - Chat API calls + socket events
8. `src/components/chat/chat-window.tsx` - Main chat UI container
9. `src/components/chat/channel-list.tsx` - Channel sidebar
10. `src/components/chat/channel-item.tsx` - Single channel (name, unread badge)
11. `src/components/chat/create-channel-modal.tsx` - Modal to create new channel
12. `src/components/chat/channel-members.tsx` - Show/manage channel members
13. `src/components/chat/message-list.tsx` - Message list container
14. `src/components/chat/message-item.tsx` - Single message bubble (avatar, content, time, edit/delete)
15. `src/components/chat/message-input.tsx` - Message input with emoji, attachments
16. `src/components/chat/typing-indicator.tsx` - "John is typing..." animation
17. `src/app/(dashboard)/workspace/[workspaceId]/chat/page.tsx` - Chat page route

**Features:**
- Workspace channels (general, project-based)
- Real-time messaging via Socket.io
- Message history with pagination
- @mentions with user autocomplete
- Typing indicators
- Read receipts
- Edit/delete messages
- Channel member management

---

### **PHASE 6: Time Tracking** ← NEW
**Goal:** Track time spent on tasks

**Backend:**
1. `src/models/TimeEntry.ts` - Time entry schema
2. `src/controllers/timeController.ts` - Time CRUD
3. `src/routes/time.routes.ts` - Time routes

**Frontend:**
4. `src/components/task/time-tracker.tsx` - Start/stop timer
5. `src/components/task/time-log.tsx` - Manual time entry
6. `src/components/time/timesheet-view.tsx` - User's time entries

**Features:**
- Start/stop timer on tasks
- Manual time entry
- Time logged per task, per user
- Weekly/monthly timesheet view

---

### **PHASE 7: Comments & Notifications**
**Goal:** Task comments and notifications

**Backend:**
1. `src/models/Comment.ts` - Comment schema
2. `src/controllers/commentController.ts` - Comment CRUD
3. `src/routes/comment.routes.ts` - Comment routes
4. `src/services/notificationService.ts` - Notifications

**Frontend:**
5. `src/components/task/comment-section.tsx` - Comments UI
6. `src/components/shared/notification-dropdown.tsx` - Notifications

---

### **PHASE 8: Dashboard Analytics** ← NEW
**Goal:** Visual analytics and reporting

**Dependencies:**
```bash
npm install recharts
```

**Frontend:**
1. `src/components/dashboard/stats-cards.tsx` - Summary cards
2. `src/components/dashboard/task-chart.tsx` - Tasks by status chart
3. `src/components/dashboard/time-chart.tsx` - Time logged chart
4. `src/components/dashboard/member-workload.tsx` - Team workload
5. `src/app/(dashboard)/workspace/[workspaceId]/analytics/page.tsx`

**Metrics:**
- Tasks by status (pie chart)
- Tasks completed over time (line chart)
- Time tracked per project (bar chart)
- Team member workload distribution

---

### **PHASE 9: RAG Knowledge Base Chatbot**
**Goal:** Per-project AI chatbot trained on uploaded documents

**Dependencies:**
```bash
# Backend
npm install openai @pinecone-database/pinecone langchain pdf-parse multer
```

**Backend:**
1. `src/models/KnowledgeBase.ts` - Document metadata
2. `src/services/ragService.ts` - Chunking, embedding, retrieval
3. `src/controllers/knowledgeController.ts` - Upload + chat
4. `src/routes/knowledge.routes.ts` - Knowledge routes

**Frontend:**
5. `src/components/knowledge/file-upload.tsx` - File upload
6. `src/components/knowledge/knowledge-chat.tsx` - Chat UI
7. `src/components/knowledge/source-citation.tsx` - Sources
8. `src/app/.../[projectId]/knowledge/page.tsx`

---

### **PHASE 10: Polish & Deploy**
**Goal:** Final polish and deployment

**Tasks:**
1. Loading skeletons on all pages
2. Error boundaries and 404 page
3. Mobile responsive CSS
4. Dark mode toggle
5. Deploy backend to Render/Railway
6. Deploy frontend to Vercel
7. Setup MongoDB Atlas
8. Setup Pinecone (free tier)

---

## 4. Features Summary

### ✅ Core Features
- User authentication (JWT)
- Workspace management with roles
- Project management
- Task CRUD with subtasks & labels
- Real-time task sync (Socket.io)
- Kanban board (drag-drop)
- Calendar view
- Team chat with channels
- Time tracking
- Comments on tasks
- Notifications

### 📊 Analytics
- Dashboard with charts
- Task completion metrics
- Time tracking reports
- Team workload visualization

### 🤖 AI Feature
- RAG Knowledge Base Chatbot per project

---

## 5. Estimated Timeline

| Phase | Duration |
|-------|----------|
| Phase 1-2 | ✅ DONE |
| Phase 3: Tasks + Real-Time | 1.5 weeks |
| Phase 4: Multiple Views | 1 week |
| Phase 5: Team Chat | 1 week |
| Phase 6: Time Tracking | 0.5 week |
| Phase 7: Comments | 0.5 week |
| Phase 8: Dashboard | 1 week |
| Phase 9: RAG Chatbot | 1.5 weeks |
| Phase 10: Polish & Deploy | 1 week |

**Total: ~8-9 weeks remaining**
