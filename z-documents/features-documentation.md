# CollabFlow - Features & File Mapping
## Complete Guide: What Feature Lives Where

> **Purpose:** Quick reference to find which files handle each feature's logic  
> **Updated:** January 2026 (TypeScript, expanded features)

---

## 🔐 1. Authentication & User Management

### Feature: User Registration & Login
**Backend:** `authController.ts` - register/login functions  
**Frontend:** `login-form.tsx`, `register-form.tsx`, `auth-store.ts`

### Feature: Protected Routes
**Backend:** `auth.middleware.ts` - JWT verification  
**Frontend:** `(dashboard)/layout.tsx` - auth check

---

## 🏢 2. Workspace Management

### Feature: Workspace CRUD & Switching
**Backend:** `workspaceController.ts`, `Workspace.ts`  
**Frontend:** `workspace-switcher.tsx`, `use-workspace.ts`

### Feature: Member Management & Invitations
**Backend:** `workspaceController.ts` - invite, remove, update role  
**Frontend:** `invite-member-dialog.tsx`, `members/page.tsx`

---

## 📁 3. Project Management

### Feature: Project CRUD
**Backend:** `projectController.ts`, `Project.ts`  
**Frontend:** `create-project-dialog.tsx`, `use-projects.ts`

---

## ✅ 4. Task Management

### Feature: Task CRUD
**Backend:** `taskController.ts`, `Task.ts`  
**Frontend:** `create-task-dialog.tsx`, `task-detail.tsx`, `use-tasks.ts`

### Feature: Subtasks ← NEW
**What it does:** Break tasks into smaller checklist items

**Task Model:**
```typescript
subtasks: [{
  title: string,
  completed: boolean
}]
```

**Frontend:** `subtask-list.tsx` - Checklist UI in task detail

### Feature: Task Labels/Tags ← NEW
**What it does:** Color-coded categories for filtering

**Task Model:**
```typescript
labels: [{
  name: string,
  color: string  // hex color
}]
```

**Frontend:** `label-picker.tsx` - Label selector

### Feature: Task Assignment & Status
**Backend:** `taskController.ts` - update assignee/status  
**Frontend:** `task-detail.tsx` - assignee dropdown, status select

---

## ⚡ 5. Real-Time Collaboration

### Feature: Live Task Updates
**Backend:** `sockets/handlers/taskHandlers.ts`  
**Frontend:** `socket.ts`, `use-socket.ts`

### Feature: User Presence
**Backend:** `sockets/handlers/presenceHandlers.ts`  
**Frontend:** `user-presence.tsx`

---

## 📊 6. Multiple Views

### Feature: Kanban Board
**Frontend:** `kanban-board.tsx`, `kanban-column.tsx`, `kanban-card.tsx`  
Uses: `@dnd-kit` for drag-and-drop

### Feature: Calendar View
**Frontend:** `calendar-view.tsx`  
Uses: `react-big-calendar`

---

## 💬 7. Team Chat ← NEW

### Feature: Real-Time Chat Channels
**What it does:** Slack-like messaging within workspaces

**Backend:**
- `src/models/Message.ts` - Message schema
- `src/models/Channel.ts` - Channel schema
- `src/controllers/chatController.ts` - CRUD
- `src/sockets/handlers/chatHandlers.ts` - Real-time events

**Frontend:**
- `src/components/chat/chat-window.tsx` - **MAIN LOGIC**
- `src/components/chat/message-list.tsx` - Messages
- `src/components/chat/message-input.tsx` - Input
- `src/components/chat/channel-list.tsx` - Channel sidebar
- `src/app/.../chat/page.tsx`

---

## ⏱️ 8. Time Tracking ← NEW

### Feature: Task Timer & Time Entries
**What it does:** Track time spent on tasks

**Backend:**
- `src/models/TimeEntry.ts` - Time entry schema
- `src/controllers/timeController.ts` - CRUD
- `src/routes/time.routes.ts`

**Frontend:**
- `src/components/task/time-tracker.tsx` - **MAIN LOGIC** - Start/stop
- `src/components/task/time-log.tsx` - Manual entry
- `src/components/time/timesheet-view.tsx` - User timesheet

**TimeEntry Model:**
```typescript
{
  user: ObjectId,
  task: ObjectId,
  project: ObjectId,
  startTime: Date,
  endTime: Date,
  duration: number,  // minutes
  description: string
}
```

---

## 💭 9. Comments & Notifications

### Feature: Task Comments
**Backend:** `Comment.ts`, `commentController.ts`  
**Frontend:** `comment-section.tsx`

### Feature: Notifications
**Backend:** `notificationService.ts`  
**Frontend:** `notification-dropdown.tsx`

---

## 📈 10. Dashboard Analytics ← NEW

### Feature: Project Analytics Dashboard
**What it does:** Visual charts and metrics

**Frontend:**
- `src/components/dashboard/stats-cards.tsx` - Summary numbers
- `src/components/dashboard/task-chart.tsx` - Tasks by status (pie)
- `src/components/dashboard/time-chart.tsx` - Time logged (bar)
- `src/components/dashboard/member-workload.tsx` - Team distribution
- `src/app/.../analytics/page.tsx`

**Metrics Shown:**
- Total tasks, completed, overdue
- Tasks by status (pie chart)
- Time tracked per project (bar chart)
- Team member workload

Uses: `recharts` library

---

## 🤖 11. RAG Knowledge Base

### Feature: AI Chatbot per Project
**What it does:** Upload docs → Ask questions → AI answers

**Backend:**
- `src/models/KnowledgeBase.ts` - Document metadata
- `src/services/ragService.ts` - **MAIN LOGIC** - Chunking, embedding, retrieval
- `src/controllers/knowledgeController.ts` - Upload + chat
- `src/routes/knowledge.routes.ts`

**Frontend:**
- `src/components/knowledge/file-upload.tsx` - Upload UI
- `src/components/knowledge/knowledge-chat.tsx` - **MAIN LOGIC**
- `src/components/knowledge/source-citation.tsx` - Sources
- `src/app/.../knowledge/page.tsx`

---

## 🎯 Quick Reference Table

| Feature | Primary File |
|---------|-------------|
| Auth | `authController.ts` |
| Tasks | `taskController.ts` |
| Real-time | `sockets/index.ts` |
| Kanban | `kanban-board.tsx` |
| Chat | `chatController.ts` |
| Time Tracking | `timeController.ts` |
| Analytics | `dashboard/stats-cards.tsx` |
| RAG Chatbot | `ragService.ts` |

---

## 📋 Complete Feature Checklist

| Category | Feature | Status |
|----------|---------|--------|
| **Auth** | Register/Login | ✅ Done |
| **Workspace** | CRUD + Members | ✅ Done |
| **Project** | CRUD | ✅ Done |
| **Task** | CRUD | Pending |
| **Task** | Subtasks | Pending |
| **Task** | Labels/Tags | Pending |
| **Real-Time** | Task Sync | Pending |
| **Real-Time** | User Presence | Pending |
| **Views** | Kanban Board | Pending |
| **Views** | Calendar | Pending |
| **Chat** | Team Channels | Pending |
| **Time** | Time Tracking | Pending |
| **Comments** | Task Comments | Pending |
| **Notifications** | Basic Alerts | Pending |
| **Analytics** | Dashboard | Pending |
| **AI** | RAG Chatbot | Pending |
