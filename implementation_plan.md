# Product Requirements Document (PRD)
## Real-Time Collaboration Platform

> **Project Name:** CollabFlow  
> **Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, Shadcn UI, Express,js, MongoDB, Socket.io  
> **Target:** Portfolio Project → Potential SaaS Launch

---

## 1. Executive Summary

**What:** A real-time project management and collaboration platform with AI-powered features.

**Target Users:** Remote teams (5-50 people), project managers, developers, creative teams

**Key Differentiators:**
- Real-time collaboration using CRDT (Yjs)
- AI-powered task management
- Interactive whiteboard
- Async video updates
- Team wellness tracking

---

## 2. Tech Stack (2026 Latest Versions)

### Frontend
```
Framework: Next.js 15 (App Router)
Language: JavaScript (ES6+)
Styling: Tailwind CSS v4
UI Components: Shadcn UI (latest)
State Management: Zustand + TanStack Query
Real-Time: Yjs + Socket.io-client
Forms: React Hook Form + Zod
Drag & Drop: dnd-kit
```

### Backend
```
Runtime: Node.js 20+
Framework: Express.js 5
Language: JavaScript (ES6+)
Real-Time: Socket.io 4.7+ + y-websocket
Database: MongoDB 7+ (Mongoose ODM)
Cache: Redis (Upstash)
Authentication: JWT + bcrypt
Validation: Zod
```

### Tools & Services
```
AI: OpenAI GPT-4 API
File Storage: Cloudflare R2 or AWS S3
Deployment: Vercel (frontend) + Render/Railway (backend)
Database Hosting: MongoDB Atlas (Free tier)
Version Control: Git + GitHub
```

---

## 3. Complete Project Structure

### 3.1 Frontend Structure (Next.js 15)

```
collaboration-platform/
├── public/
│   ├── images/
│   └── fonts/
│
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                  # Auth route group
│   │   │   ├── login/
│   │   │   │   └── page.jsx
│   │   │   ├── register/
│   │   │   │   └── page.jsx
│   │   │   └── layout.jsx
│   │   │
│   │   ├── (dashboard)/              # Protected routes group
│   │   │   ├── workspace/
│   │   │   │   └── [workspaceId]/
│   │   │   │       ├── page.jsx      # Workspace overview
│   │   │   │       ├── projects/
│   │   │   │       │   └── [projectId]/
│   │   │   │       │       ├── page.jsx
│   │   │   │       │       ├── board/
│   │   │   │       │       │   └── page.jsx
│   │   │   │       │       ├── calendar/
│   │   │   │       │       │   └── page.jsx
│   │   │   │       │       ├── timeline/
│   │   │   │       │       │   └── page.jsx
│   │   │   │       │       └── canvas/
│   │   │   │       │           └── page.jsx
│   │   │   │       └── settings/
│   │   │   │           └── page.jsx
│   │   │   └── layout.jsx
│   │   │
│   │   ├── api/                      # API Routes
│   │   │   ├── auth/
│   │   │   │   ├── register/
│   │   │   │   │   └── route.js
│   │   │   │   └── login/
│   │   │   │       └── route.js
│   │   │   └── health/
│   │   │       └── route.js
│   │   │
│   │   ├── layout.jsx                # Root layout
│   │   ├── page.jsx                  # Landing page
│   │   ├── globals.css               # Global styles
│   │   └── not-found.jsx
│   │
│   ├── components/
│   │   ├── ui/                       # Shadcn UI components
│   │   │   ├── button.jsx
│   │   │   ├── card.jsx
│   │   │   ├── dialog.jsx
│   │   │   ├── input.jsx
│   │   │   ├── dropdown-menu.jsx
│   │   │   ├── avatar.jsx
│   │   │   ├── badge.jsx
│   │   │   ├── toast.jsx
│   │   │   └── ... (more shadcn components)
│   │   │
│   │   ├── auth/
│   │   │   ├── login-form.jsx
│   │   │   └── register-form.jsx
│   │   │
│   │   ├── workspace/
│   │   │   ├── workspace-switcher.jsx
│   │   │   ├── sidebar.jsx
│   │   │   └── workspace-settings.jsx
│   │   │
│   │   ├── project/
│   │   │   ├── project-card.jsx
│   │   │   ├── project-list.jsx
│   │   │   └── create-project-dialog.jsx
│   │   │
│   │   ├── task/
│   │   │   ├── task-card.jsx
│   │   │   ├── task-list.jsx
│   │   │   ├── task-detail.jsx
│   │   │   ├── create-task-dialog.jsx
│   │   │   ├── task-assignee.jsx
│   │   │   └── task-priority-badge.jsx
│   │   │
│   │   ├── board/
│   │   │   ├── kanban-board.jsx
│   │   │   ├── kanban-column.jsx
│   │   │   └── kanban-card.jsx
│   │   │
│   │   ├── calendar/
│   │   │   └── calendar-view.jsx
│   │   │
│   │   ├── timeline/
│   │   │   └── gantt-chart.jsx
│   │   │
│   │   ├── canvas/
│   │   │   ├── whiteboard.jsx
│   │   │   ├── sticky-note.jsx
│   │   │   └── drawing-tools.jsx
│   │   │
│   │   ├── realtime/
│   │   │   ├── cursor-presence.jsx
│   │   │   ├── user-avatar-stack.jsx
│   │   │   └── typing-indicator.jsx
│   │   │
│   │   ├── ai/
│   │   │   ├── ai-task-breakdown.jsx
│   │   │   ├── ai-summarize.jsx
│   │   │   └── ai-chat.jsx
│   │   │
│   │   └── shared/
│   │       ├── navbar.jsx
│   │       ├── loading-spinner.jsx
│   │       └── error-boundary.jsx
│   │
│   ├── lib/
│   │   ├── api.js                    # API client
│   │   ├── socket.js                 # Socket.io client
│   │   ├── yjs.js                    # Yjs CRDT setup
│   │   ├── utils.js                  # Utility functions
│   │   └── constants.js
│   │
│   ├── hooks/
│   │   ├── use-socket.js
│   │   ├── use-realtime.js
│   │   ├── use-workspace.js
│   │   ├── use-tasks.js
│   │   ├── use-auth.js
│   │   └── use-ai.js
│   │
│   ├── store/
│   │   ├── auth-store.js             # Zustand store
│   │   ├── workspace-store.js
│   │   └── ui-store.js
│   │
│   └── config/
│       └── site.js
│
├── .env.local
├── .env.example
├── .gitignore
├── next.config.js
├── tailwind.config.js
├── jsconfig.json
├── package.json
├── components.json                    # Shadcn UI config
└── README.md
```

### 3.2 Backend Structure (Express + MongoDB + Socket.io)

```
backend/
├── src/
│   ├── config/
│   │   ├── db.js                    # MongoDB connection
│   │   ├── redis.js                 # Redis connection
│   │   └── env.js                   # Environment variables
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Workspace.js
│   │   ├── Project.js
│   │   ├── Task.js
│   │   ├── Comment.js
│   │   └── Notification.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── workspaceController.js
│   │   ├── projectController.js
│   │   ├── taskController.js
│   │   ├── commentController.js
│   │   └── aiController.js
│   │
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── workspace.routes.js
│   │   ├── project.routes.js
│   │   ├── task.routes.js
│   │   ├── comment.routes.js
│   │   └── ai.routes.js
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js       # JWT verification
│   │   ├── error.middleware.js      # Error handling
│   │   ├── validation.middleware.js # Zod validation
│   │   └── rateLimit.middleware.js
│   │
│   ├── services/
│   │   ├── aiService.js             # OpenAI integration
│   │   ├── emailService.js
│   │   ├── uploadService.js         # File upload (S3/R2)
│   │   └── notificationService.js
│   │
│   ├── sockets/
│   │   ├── index.js                 # Socket.io setup
│   │   ├── handlers/
│   │   │   ├── taskHandlers.js
│   │   │   ├── presenceHandlers.js
│   │   │   └── canvasHandlers.js
│   │   └── middleware/
│   │       └── socketAuth.js
│   │
│   ├── utils/
│   │   ├── jwt.js
│   │   ├── bcrypt.js
│   │   ├── logger.js
│   │   └── validators.js
│   │
│   ├── app.js                       # Express app setup
│   └── server.js                    # Server entry point
│
├── .env
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## 4. Phase-by-Phase Implementation Plan

### **PHASE 1: Setup & Foundation (Week 1)**
**Goal:** Project setup + Authentication

#### Dependencies to Install:

**Backend:**
```bash
cd backend
npm install express mongoose dotenv bcryptjs jsonwebtoken cors socket.io zod helmet express-rate-limit
npm install -D nodemon
```

**Frontend:**
```bash
cd frontend
npx create-next-app@latest .
npm install zustand @tanstack/react-query axios zod react-hook-form
npx shadcn@latest init
npx shadcn@latest add button input card label form
```

#### Files to Create (In Sequence):

**Backend:**
1. `backend/package.json` - Initialize project
2. `backend/.env.example` - Environment variables template
3. `backend/src/config/env.js` - Load environment variables
4. `backend/src/config/db.js` - MongoDB connection
5. `backend/src/models/User.js` - User schema
6. `backend/src/utils/jwt.js` - JWT helpers
7. `backend/src/utils/bcrypt.js` - Password hashing
8. `backend/src/middleware/auth.middleware.js` - Authentication middleware
9. `backend/src/controllers/authController.js` - Auth logic
10. `backend/src/routes/auth.routes.js` - Auth routes
11. `backend/src/app.js` - Express app setup
12. `backend/src/server.js` - Start server

**Frontend:**

13. Initialize Next.js project
    ```bash
    npx create-next-app@latest frontend
    ```

14. `frontend/next.config.js` - Next.js config

15. `frontend/tailwind.config.js` - Tailwind config

16. `frontend/jsconfig.json` - JavaScript path aliases config

17. `frontend/.env.example` - Environment variables

18. Setup Shadcn UI
    ```bash
    npx shadcn@latest init
    ```

19. `src/lib/api.js` - API client setup

20. `src/lib/utils.js` - Utility functions

21. `src/store/auth-store.js` - Auth Zustand store

22. Install Shadcn components
    ```bash
    npx shadcn@latest add button input card label form
    ```

23. `src/components/auth/login-form.jsx` - Login form

24. `src/components/auth/register-form.jsx` - Register form

25. `src/app/(auth)/login/page.jsx` - Login page

26. `src/app/(auth)/register/page.jsx` - Register page

27. `src/app/(auth)/layout.jsx` - Auth layout

28. `src/app/page.jsx` - Landing page

29. `src/app/layout.jsx` - Root layout with providers

**Testing Phase 1:**
- Test registration endpoint with Postman/Thunder Client
- Test login endpoint
- Test JWT generation and expiration
- Test frontend authentication forms
- Test token storage and retrieval
- Deploy backend to Render/Railway
- Deploy frontend to Vercel

---

### **PHASE 2: Workspace & Project Management (Week 2)**
**Goal:** Core data models + CRUD operations

#### Dependencies to Install:

**Frontend:**
```bash
npm install @tanstack/react-query
npx shadcn@latest add dialog dropdown-menu avatar tabs select
```

#### Files to Create (In Sequence):

**Backend:**

1. `backend/src/models/Workspace.js` - Workspace schema

2. `backend/src/models/Project.js` - Project schema

3. `backend/src/controllers/workspaceController.js` - Workspace CRUD

4. `backend/src/controllers/projectController.js` - Project CRUD

5. `backend/src/routes/workspace.routes.js` - Workspace routes

6. `backend/src/routes/project.routes.js` - Project routes

7. Update `backend/src/app.js` - Add new routes

**Frontend:**

8. `src/hooks/use-workspace.js` - Workspace hooks

9. `src/hooks/use-projects.js` - Project hooks

10. Install Shadcn components
    ```bash
    npx shadcn@latest add dialog dropdown-menu avatar tabs select
    ```

11. `src/components/workspace/workspace-switcher.jsx` - Workspace switcher

12. `src/components/workspace/sidebar.jsx` - Navigation sidebar

13. `src/components/project/project-card.jsx` - Project card component

14. `src/components/project/project-list.jsx` - Project list view

15. `src/components/project/create-project-dialog.jsx` - Create project dialog

16. `src/app/(dashboard)/layout.jsx` - Dashboard layout

17. `src/app/(dashboard)/workspace/[workspaceId]/page.jsx` - Workspace overview

18. `src/app/(dashboard)/workspace/[workspaceId]/projects/page.jsx` - Projects list

**Testing Phase 2:**
- Create workspace via API
- Create multiple projects in workspace
- Test workspace switcher UI
- Test project cards rendering
- Test project CRUD operations

---

### **PHASE 3: Task Management + Real-Time Sync (Week 3-4)**
**Goal:** Tasks with real-time collaboration

#### Dependencies to Install:

**Backend:**
```bash
# Socket.io already installed in Phase 1
npm install y-websocket
```

**Frontend:**
```bash
npm install yjs y-websocket socket.io-client
npx shadcn@latest add badge select textarea popover calendar
```

#### Files to Create (In Sequence):

**Backend:**

1. `backend/src/models/Task.js` - Task schema

2. `backend/src/controllers/taskController.js` - Task CRUD

3. `backend/src/routes/task.routes.js` - Task routes

4. `backend/src/sockets/index.js` - Socket.io setup

5. `backend/src/sockets/middleware/socketAuth.js` - Socket authentication

6. `backend/src/sockets/handlers/taskHandlers.js` - Task real-time events

7. `backend/src/sockets/handlers/presenceHandlers.js` - User presence tracking

8. Update `backend/src/server.js` - Add Socket.io server

**Frontend:**

9. Install packages
   ```bash
   npm install yjs y-websocket socket.io-client
   ```

10. `src/lib/socket.js` - Socket.io client setup

11. `src/lib/yjs.js` - Yjs CRDT configuration

12. `src/hooks/use-socket.js` - Socket connection hook

13. `src/hooks/use-realtime.js` - Real-time sync hook

14. `src/hooks/use-tasks.js` - Task management hook

15. Install Shadcn components
    ```bash
    npx shadcn@latest add badge select textarea popover calendar
    ```

16. `src/components/task/task-card.jsx` - Task card component

17. `src/components/task/task-list.jsx` - Task list view

18. `src/components/task/task-detail.jsx` - Task detail panel

19. `src/components/task/create-task-dialog.jsx` - Create task dialog

20. `src/components/task/task-assignee.jsx` - Assignee selector

21. `src/components/task/task-priority-badge.jsx` - Priority badge

22. `src/components/realtime/cursor-presence.jsx` - Cursor tracking

23. `src/components/realtime/user-avatar-stack.jsx` - Active users display

24. `src/app/(dashboard)/workspace/[workspaceId]/projects/[projectId]/page.jsx` - Project tasks

**Testing Phase 3:**
- Create and update tasks
- Test real-time updates (open in 2 browsers)
- Test cursor presence tracking
- Test task assignment and priority
- Test real-time notifications

---

### **PHASE 4: Multiple Views (Week 5)**
**Goal:** Kanban, Calendar, Timeline views

#### Dependencies to Install:

**Frontend:**
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install react-big-calendar date-fns
npm install recharts
```

#### Files to Create (In Sequence):

**Frontend:**

1. Install drag & drop packages
   ```bash
   npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
   ```

2. `src/components/board/kanban-board.jsx` - Main Kanban board

3. `src/components/board/kanban-column.jsx` - Kanban column

4. `src/components/board/kanban-card.jsx` - Draggable task card

5. `src/app/(dashboard)/workspace/[workspaceId]/projects/[projectId]/board/page.jsx` - Board view

6. Install calendar package
   ```bash
   npm install react-big-calendar date-fns
   ```

7. `src/components/calendar/calendar-view.jsx` - Calendar component

8. `src/app/(dashboard)/workspace/[workspaceId]/projects/[projectId]/calendar/page.jsx` - Calendar page

9. `src/components/timeline/gantt-chart.jsx` - Timeline/Gantt view

10. `src/app/(dashboard)/workspace/[workspaceId]/projects/[projectId]/timeline/page.jsx` - Timeline page

**Testing Phase 4:**
- Test Kanban drag & drop between columns
- Test calendar view with task dates
- Test timeline view for project scheduling
- Test view persistence and switching

---

### **PHASE 5: AI Features (Week 6-7)**
**Goal:** AI task breakdown, prioritization, summaries

#### Dependencies to Install:

**Backend:**
```bash
npm install openai
```

#### Files to Create (In Sequence):

**Backend:**

1. Install OpenAI SDK
   ```bash
   npm install openai
   ```

2. `backend/src/services/aiService.js` - OpenAI integration

3. `backend/src/controllers/aiController.js` - AI endpoints

4. `backend/src/routes/ai.routes.js` - AI routes

5. Update `backend/src/app.js` - Add AI routes

**Frontend:**

6. `src/hooks/use-ai.js` - AI operations hook

7. Install Shadcn components
   ```bash
   npx shadcn@latest add sheet popover command
   ```

8. `src/components/ai/ai-task-breakdown.jsx` - Task breakdown UI

9. `src/components/ai/ai-summarize.jsx` - Summary generator

10. `src/components/ai/ai-chat.jsx` - AI assistant chat

11. Add AI buttons to task detail page

**Testing Phase 5:**
- Test AI task breakdown from description
- Test AI project summaries
- Test AI task prioritization
- Test AI response time and quality

---

### **PHASE 6: Comments & Notifications (Week 7)**
**Goal:** Communication features

#### Dependencies to Install:

**Frontend:**
```bash
npx shadcn@latest add toast sonner
```

#### Files to Create (In Sequence):

**Backend:**

1. `backend/src/models/Comment.js` - Comment schema

2. `backend/src/models/Notification.js` - Notification schema

3. `backend/src/controllers/commentController.js` - Comment CRUD

4. `backend/src/routes/comment.routes.js` - Comment routes

5. `backend/src/services/notificationService.js` - Notification service

**Frontend:**

6. Install Shadcn components
   ```bash
   npx shadcn@latest add toast sonner
   ```

7. `src/components/task/comment-section.jsx` - Comments UI

8. `src/components/shared/notification-dropdown.jsx` - Notifications panel

**Testing Phase 6:**
- Test adding comments to tasks
- Test real-time comment updates
- Test notification system
- Test notification preferences

---

### **PHASE 7: Interactive Canvas/Whiteboard (Week 8)**
**Goal:** Collaborative whiteboard

#### Dependencies to Install:

**Frontend:**
```bash
npm install fabric react-konva konva
```

#### Files to Create (In Sequence):

**Backend:**

1. `backend/src/sockets/handlers/canvasHandlers.js` - Canvas sync events

**Frontend:**

2. Install canvas library
   ```bash
   npm install fabric react-konva konva
   ```

3. `src/components/canvas/whiteboard.jsx` - Main whiteboard component

4. `src/components/canvas/sticky-note.jsx` - Sticky note element

5. `src/components/canvas/drawing-tools.jsx` - Drawing toolbar

6. `src/app/(dashboard)/workspace/[workspaceId]/projects/[projectId]/canvas/page.jsx` - Canvas page

**Testing Phase 7:**
- Test multi-user drawing synchronization
- Test sticky notes creation and editing
- Test drawing tools (pen, shapes, text)
- Test canvas save/load functionality

---

### **PHASE 8: Polish & UI/UX (Week 9)**
**Goal:** Responsive design, loading states, error handling

#### Files to Create (In Sequence):

**Frontend:**

1. `src/components/shared/loading-spinner.jsx` - Loading component

2. `src/components/shared/error-boundary.jsx` - Error boundary

3. `src/components/shared/skeleton-loader.jsx` - Skeleton screens

4. `src/app/not-found.jsx` - 404 page

5. Update all components with loading states

6. Add responsive CSS for mobile/tablet

7. Implement dark mode support
   ```bash
   npx shadcn@latest add switch
   ```

8. Add animations and transitions

**Testing Phase 8:**
- Test on mobile devices (320px, 375px, 768px)
- Test on tablets (768px, 1024px)
- Test on desktop (1280px, 1920px)
- Test error states and recovery
- Test dark mode toggle
- Lighthouse performance audit

---

### **PHASE 9: Deployment (Week 10)**
**Goal:** Deploy to production

#### Deployment Steps (In Sequence):

**Database Setup:**

1. Create MongoDB Atlas account
   - Visit: https://www.mongodb.com/cloud/atlas/register
   - Choose free M0 tier
   - Create cluster
   - Create database user
   - Whitelist IP: 0.0.0.0/0 (all IPs)
   - Copy connection string

2. Create Upstash Redis account (optional)
   - Visit: https://upstash.com
   - Create free Redis database
   - Copy Redis URL

**Backend Deployment:**

3. Create account on Render/Railway
   - Render: https://render.com
   - Railway: https://railway.app

4. Deploy backend
   - Connect GitHub repository
   - Set environment variables:
     ```
     NODE_ENV=production
     MONGODB_URI=<atlas_connection_string>
     JWT_SECRET=<generate_secure_random_string>
     CLIENT_URL=<vercel_frontend_url>
     OPENAI_API_KEY=<your_openai_key>
     ```
   - Deploy and get backend URL

**Frontend Deployment:**

5. Setup OpenAI API key
   - Visit: https://platform.openai.com/api-keys
   - Create new API key
   - Add to backend .env

6. Deploy frontend to Vercel
   - Visit: https://vercel.com
   - Import GitHub repository
   - Set environment variables:
     ```
     NEXT_PUBLIC_API_URL=<backend_url>
     ```
   - Deploy

**Post-Deployment:**

7. Test production deployment
   - Test authentication flow
   - Test real-time features
   - Test AI features
   - Monitor error logs

8. Create landing page
   - Add features showcase
   - Add pricing (if SaaS)
   - Add demo/signup CTA

9. Write comprehensive README.md
   - Installation instructions
   - Environment setup
   - API documentation
   - Deployment guide

10. Monitor and optimize
    - Setup error tracking (Sentry)
    - Monitor performance
    - Gather user feedback

---

## 5. Verification Plan

### Automated Testing
- Write Jest tests for backend API endpoints
- Write React Testing Library tests for components

### Manual Testing
1. Open 2 browsers side-by-side
2. Login on both
3. Create task on browser 1 → Should appear instantly on browser 2
4. Test drag & drop
5. Test AI features

### Performance Testing
- Lighthouse score > 90
- WebSocket latency < 100ms

---

## User Review Required

> [!IMPORTANT]
> **Review this PRD before proceeding:**
> - Is the file structure clear?
> - Are you comfortable with the 10-week timeline?
> - Any features you want to add/remove?
> - Any questions about the tech stack?

Once approved, we'll begin Phase 1 implementation.
