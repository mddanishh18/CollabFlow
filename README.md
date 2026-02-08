# CollabFlow 🚀

> A modern, real-time team collaboration platform built with the MERN stack, featuring instant messaging, project management, and seamless team coordination.

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://collabflow-web.vercel.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)](https://www.mongodb.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.8-orange)](https://socket.io/)

**Live Demo:** [collabflow-web.vercel.app](https://collabflow-web.vercel.app)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Screenshots](#-screenshots)
- [Key Highlights](#-key-highlights-for-recruiters)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)

---

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based secure authentication
- Role-based access control (Owner, Admin, Member, Viewer)
- Password encryption with bcrypt
- Protected routes and API endpoints
- Session management with automatic token refresh

### 💬 Real-Time Chat
- **Instant messaging** with Socket.io WebSockets
- **Channel-based communication** (Public, Private, Direct Messages)
- **Read receipts** with timestamps
- **Unread message counts** with real-time updates
- **Typing indicators** showing who's typing
- **Message editing & deletion** with optimistic updates
- **@mentions** for user notifications
- **Mobile-optimized** chat interface with sticky headers

### 👥 Workspace & Team Management
- Create and manage multiple workspaces
- Invite team members via email
- Role-based permissions (Owner → Admin → Member → Viewer)
- Member management with role updates
- Workspace settings and customization

### 📊 Project Management
- Create and organize projects within workspaces
- Assign team members to projects
- Project-specific permissions
- Task tracking and management
- Project settings and configuration

### ✅ Task Management
- Create, assign, and track tasks
- Task priorities (Low, Medium, High, Urgent)
- Task status tracking (To Do, In Progress, In Review, Done)
- Due dates and deadlines
- Task assignment to team members
- Real-time task updates

### 🎨 Modern UI/UX
- **Responsive design** - Mobile, tablet, and desktop optimized
- **Dark/Light mode** with system preference detection
- **Shadcn UI** components for consistent design
- **Smooth animations** and transitions
- **Loading states** and skeleton screens
- **Toast notifications** for user feedback
- **Mobile-first** approach with hamburger navigation

### 🔔 Real-Time Features
- Live connection status indicator
- Automatic reconnection on network issues
- Real-time presence detection
- Instant updates across all connected clients
- Optimistic UI updates for better UX

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 15 (App Router, React Server Components)
- **Language:** TypeScript 5.0
- **Styling:** Tailwind CSS v4
- **UI Components:** Shadcn UI
- **State Management:** Zustand
- **Real-time:** Socket.io Client
- **Form Validation:** Zod
- **HTTP Client:** Fetch API with custom wrapper
- **Deployment:** Vercel

### Backend
- **Runtime:** Node.js with Express.js
- **Language:** TypeScript
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (jsonwebtoken)
- **Real-time:** Socket.io Server
- **Security:** Helmet, CORS, bcryptjs
- **Rate Limiting:** express-rate-limit
- **Deployment:** Render / Railway

### DevOps & Tools
- **Version Control:** Git & GitHub
- **Package Manager:** npm
- **Code Quality:** ESLint, Prettier
- **Environment:** dotenv for configuration
- **Build Tool:** Next.js Turbopack

---

## 🏗️ Architecture

### System Design
```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Client    │◄───────►│   Server    │◄───────►│  Database   │
│  (Next.js)  │  HTTP   │  (Express)  │  ODM    │  (MongoDB)  │
│             │  REST   │             │ Mongoose│             │
└─────────────┘         └─────────────┘         └─────────────┘
       │                       │
       │    WebSocket          │
       └───────────────────────┘
            (Socket.io)
```

### Key Architectural Decisions
- **Monorepo structure** for frontend and backend
- **RESTful API** for CRUD operations
- **WebSocket** for real-time features
- **JWT tokens** stored in memory (not localStorage for security)
- **Optimistic updates** for instant UI feedback
- **Server-side validation** with Zod schemas
- **Role-based middleware** for authorization

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/mddanishh18/CollabFlow.git
cd CollabFlow
```

2. **Backend Setup**
```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Start backend server
npm run dev
```
Backend runs on `http://localhost:5000`

3. **Frontend Setup**
```bash
cd frontend
npm install

# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:5000" > .env.local
echo "NEXT_PUBLIC_SOCKET_URL=http://localhost:5000" >> .env.local

# Start frontend dev server
npm run dev
```
Frontend runs on `http://localhost:3000`

### Environment Variables

**Backend (.env)**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/collabflow
JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

**Frontend (.env.local)**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

---

## 📸 Screenshots

### Dashboard
![Dashboard](https://via.placeholder.com/800x400?text=Dashboard+Screenshot)

### Real-Time Chat
![Chat](https://via.placeholder.com/800x400?text=Chat+Interface)

### Project Management
![Projects](https://via.placeholder.com/800x400?text=Project+Management)

### Mobile Responsive
![Mobile](https://via.placeholder.com/400x800?text=Mobile+View)

---

## 🎯 Key Highlights (For Recruiters)

### Technical Proficiency Demonstrated

✅ **Full-Stack Development**
- Built complete MERN stack application from scratch
- Implemented both frontend and backend with TypeScript
- Designed and implemented RESTful APIs
- Created responsive, mobile-first UI

✅ **Real-Time Systems**
- Implemented WebSocket communication with Socket.io
- Built real-time chat with typing indicators and read receipts
- Handled connection management and reconnection logic
- Optimized for low latency and high concurrency

✅ **Database Design**
- Designed MongoDB schemas with Mongoose
- Implemented relationships (users, workspaces, projects, tasks, messages)
- Optimized queries with indexing
- Handled data validation and constraints

✅ **Authentication & Security**
- Implemented JWT-based authentication
- Built role-based access control (RBAC)
- Secured API endpoints with middleware
- Applied security best practices (Helmet, CORS, rate limiting)

✅ **State Management**
- Managed complex application state with Zustand
- Implemented optimistic UI updates
- Handled real-time state synchronization
- Built custom hooks for reusable logic

✅ **Modern Frontend Practices**
- Used Next.js 15 App Router and React Server Components
- Implemented TypeScript for type safety
- Built reusable component library with Shadcn UI
- Optimized for performance and SEO

✅ **Mobile Responsiveness**
- Mobile-first design approach
- Fixed complex mobile keyboard issues (iOS/Android)
- Implemented touch-friendly interactions
- Optimized for various screen sizes

✅ **DevOps & Deployment**
- Deployed frontend on Vercel with CI/CD
- Deployed backend on Render/Railway
- Configured environment variables
- Implemented production-ready error handling

### Problem-Solving Examples

**Challenge 1: Mobile Chat Keyboard Issues**
- **Problem:** Keyboard caused viewport shifting and scroll jumping on mobile
- **Solution:** Implemented `interactive-widget=resizes-content` meta tag, sticky headers, and conditional refocus logic
- **Impact:** Seamless mobile chat experience across iOS and Android

**Challenge 2: Real-Time Read Receipts**
- **Problem:** Needed to track who read each message in group chats
- **Solution:** Built Socket.io event system with optimistic updates and database persistence
- **Impact:** WhatsApp-like read receipt functionality

**Challenge 3: Role-Based Permissions**
- **Problem:** Complex permission hierarchy across workspaces and projects
- **Solution:** Implemented middleware-based RBAC with cascading permissions
- **Impact:** Secure, scalable authorization system

---

## 📂 Project Structure

```
CollabFlow/
├── backend/
│   ├── src/
│   │   ├── config/           # Database & environment config
│   │   ├── controllers/      # Business logic (auth, workspace, chat, etc.)
│   │   ├── middleware/       # Auth, error handling, validation
│   │   ├── models/           # Mongoose schemas (User, Workspace, Message, etc.)
│   │   ├── routes/           # Express routes
│   │   ├── sockets/          # Socket.io event handlers
│   │   ├── utils/            # Helper functions (JWT, logger, etc.)
│   │   ├── app.ts            # Express app configuration
│   │   └── server.ts         # Server entry point
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── src/
    │   ├── app/              # Next.js App Router pages
    │   │   ├── (auth)/       # Auth pages (login, register)
    │   │   ├── (dashboard)/  # Protected dashboard pages
    │   │   └── layout.tsx    # Root layout
    │   ├── components/       # React components
    │   │   ├── auth/         # Auth forms
    │   │   ├── chat/         # Chat components
    │   │   ├── project/      # Project management
    │   │   ├── task/         # Task components
    │   │   ├── workspace/    # Workspace components
    │   │   └── ui/           # Shadcn UI components
    │   ├── hooks/            # Custom React hooks
    │   ├── lib/              # Utilities & API client
    │   ├── store/            # Zustand stores
    │   └── types/            # TypeScript types
    ├── package.json
    └── tsconfig.json
```

---

## 📡 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Workspaces
- `GET /api/workspaces` - Get user's workspaces
- `POST /api/workspaces` - Create workspace
- `GET /api/workspaces/:id` - Get workspace details
- `PUT /api/workspaces/:id` - Update workspace
- `DELETE /api/workspaces/:id` - Delete workspace
- `POST /api/workspaces/:id/members` - Add member
- `DELETE /api/workspaces/:id/members/:userId` - Remove member

### Projects
- `GET /api/projects` - Get workspace projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Tasks
- `GET /api/tasks` - Get project tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Chat
- `GET /api/chat/channels/:workspaceId` - Get workspace channels
- `POST /api/chat/channels` - Create channel
- `GET /api/chat/messages/:channelId` - Get channel messages
- `POST /api/chat/messages` - Send message
- `PUT /api/chat/messages/:id` - Edit message
- `DELETE /api/chat/messages/:id` - Delete message

### WebSocket Events
- `connection` - Client connects
- `join_channel` - Join chat channel
- `leave_channel` - Leave chat channel
- `send_message` - Send chat message
- `typing_start` - User starts typing
- `typing_stop` - User stops typing
- `message_read` - Mark message as read

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Developer

**Danish**
- GitHub: [@mddanishh18](https://github.com/mddanishh18)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourprofile)
- Portfolio: [Your Portfolio](https://yourportfolio.com)

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Shadcn UI](https://ui.shadcn.com/) - UI component library
- [Socket.io](https://socket.io/) - Real-time engine
- [MongoDB](https://www.mongodb.com/) - Database
- [Vercel](https://vercel.com/) - Frontend hosting

---

**⭐ If you found this project helpful, please consider giving it a star!**
