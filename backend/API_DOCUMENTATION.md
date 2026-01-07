# CollabFlow Backend API Documentation

**Base URL:** `http://localhost:5000`

---

## Authentication

All protected routes require a Bearer token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## 🔐 Auth Routes (`/api/auth`)

### Register User
```
POST /api/auth/register
```
**Auth Required:** No

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { "_id": "...", "name": "John Doe", "email": "john@example.com" },
    "token": "jwt_token_here"
  }
}
```

---

### Login User
```
POST /api/auth/login
```
**Auth Required:** No

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": { "_id": "...", "name": "John Doe", "email": "john@example.com" },
    "token": "jwt_token_here"
  }
}
```

---

### Get Current User Profile
```
GET /api/auth/me
```
**Auth Required:** ✅ Yes

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": { "_id": "...", "name": "John Doe", "email": "john@example.com" }
  }
}
```

---

### Update Profile
```
PUT /api/auth/profile
```
**Auth Required:** ✅ Yes

**Request Body:**
```json
{
  "name": "John Updated",
  "avatar": "https://example.com/avatar.jpg"
}
```

**Response:** `200 OK`

---

### Logout
```
POST /api/auth/logout
```
**Auth Required:** ✅ Yes

**Response:** `200 OK`

---

## 🏢 Workspace Routes (`/api/workspaces`)

> All workspace routes require authentication

### Create Workspace
```
POST /api/workspaces
```

**Request Body:**
```json
{
  "name": "My Workspace",
  "description": "Optional description",
  "settings": {
    "isPublic": false,
    "allowMemberInvites": false,
    "defaultProjectVisibility": "workspace"
  }
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Workspace created successfully",
  "data": { "workspace": { ... } }
}
```

---

### Get User's Workspaces
```
GET /api/workspaces
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "workspaces": [
      { "_id": "...", "name": "Workspace 1", "members": [...], "userRole": "owner" }
    ]
  }
}
```

---

### Get Workspace by ID
```
GET /api/workspaces/:workspaceId
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "workspace": { ... },
    "userRole": "owner"
  }
}
```

---

### Update Workspace
```
PATCH /api/workspaces/:workspaceId
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "description": "Updated description"
}
```

**Response:** `200 OK`

---

### Delete Workspace
```
DELETE /api/workspaces/:workspaceId
```

**Response:** `200 OK`

---

### Get User's Pending Invitations
```
GET /api/workspaces/invitations/pending
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "invitations": [
      {
        "workspace": { "_id": "...", "name": "Team Workspace" },
        "role": "member",
        "invitedBy": { "name": "John", "email": "john@example.com" },
        "token": "invitation_token",
        "expiresAt": "2026-01-13T..."
      }
    ]
  }
}
```

---

### Invite Member to Workspace
```
POST /api/workspaces/:workspaceId/invite
```

**Request Body:**
```json
{
  "email": "newmember@example.com",
  "role": "member"
}
```
*Role options: `admin`, `member`, `viewer`*

**Response:** `200 OK`

---

### Accept Workspace Invitation
```
POST /api/workspaces/invite/accept/:token
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Successfully joined workspace",
  "data": { "workspace": { ... } }
}
```

---

### Remove Member from Workspace
```
DELETE /api/workspaces/:workspaceId/members/:memberId
```

**Response:** `200 OK`

---

### Update Member Role
```
PATCH /api/workspaces/:workspaceId/members/:memberId/role
```

**Request Body:**
```json
{
  "role": "admin"
}
```

**Response:** `200 OK`

---

### Leave Workspace
```
POST /api/workspaces/:workspaceId/leave
```

**Response:** `200 OK`

---

### Get Workspace Members
```
GET /api/workspaces/:workspaceId/members
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "members": [
      { "user": { "_id": "...", "name": "John", "email": "..." }, "role": "owner" }
    ]
  }
}
```

---

### Get Workspace Invitations (Sent)
```
GET /api/workspaces/:workspaceId/invitations
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "invitations": [
      { "email": "pending@example.com", "role": "member", "status": "pending" }
    ]
  }
}
```

---

## 📁 Project Routes (`/api/projects`)

> All project routes require authentication

### Create Project
```
POST /api/projects
```

**Request Body:**
```json
{
  "name": "My Project",
  "description": "Project description",
  "workspace": "workspace_id",
  "status": "planning",
  "priority": "medium",
  "visibility": "workspace",
  "color": "#3B82F6",
  "tags": ["frontend", "urgent"],
  "startDate": null,
  "dueDate": null,
  "settings": {
    "allowComments": true,
    "notifyOnTaskUpdate": true,
    "enableRealTimeEditing": true
  }
}
```

**Response:** `201 Created`

---

### Get User's Projects
```
GET /api/projects
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "projects": [...]
  }
}
```

---

### Get Projects by Workspace
```
GET /api/projects/workspace/:workspaceId
```

**Query Params:** `?status=active&priority=high&tags=frontend,backend`

**Response:** `200 OK`

---

### Get Project by ID
```
GET /api/projects/:projectId
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "project": { ... },
    "userRole": "owner",
    "permissions": { "canEdit": true, "canView": true }
  }
}
```

---

### Update Project
```
PATCH /api/projects/:projectId
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "status": "active",
  "progress": 50
}
```

**Response:** `200 OK`

---

### Delete Project
```
DELETE /api/projects/:projectId
```

**Query Params:** `?permanent=true` (optional, for permanent deletion)

**Response:** `200 OK`

---

### Add Project Member
```
POST /api/projects/:projectId/members
```

**Request Body:**
```json
{
  "userId": "user_object_id",
  "role": "editor"
}
```
*Role options: `editor`, `viewer`*

**Response:** `200 OK`

---

### Remove Project Member
```
DELETE /api/projects/:projectId/members/:memberId
```

**Response:** `200 OK`

---

### Update Project Member Role
```
PATCH /api/projects/:projectId/members/:memberId/role
```

**Request Body:**
```json
{
  "role": "viewer"
}
```

**Response:** `200 OK`

---

### Leave Project
```
POST /api/projects/:projectId/leave
```

**Response:** `200 OK`

---

### Get Project Members
```
GET /api/projects/:projectId/members
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "members": [
      { "user": { ... }, "role": "owner", "addedAt": "..." }
    ]
  }
}
```

---

## Error Responses

All endpoints may return the following error formats:

**400 Bad Request** (Validation Error)
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    { "field": "name", "message": "Name is required" }
  ]
}
```

**401 Unauthorized**
```json
{
  "success": false,
  "message": "No token provided"
}
```

**403 Forbidden**
```json
{
  "success": false,
  "message": "Access denied"
}
```

**404 Not Found**
```json
{
  "success": false,
  "message": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "message": "Server error",
  "error": "Error details"
}
```

---

## Summary

| Category | Endpoints |
|----------|-----------|
| Auth | 5 |
| Workspaces | 12 |
| Projects | 10 |
| **Total** | **27** |
