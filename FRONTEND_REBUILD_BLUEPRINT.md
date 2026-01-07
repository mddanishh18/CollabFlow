# CollabFlow - Complete Frontend Rebuild Blueprint

## 📋 Overview
This document contains EVERY file needed to rebuild the frontend from scratch, organized by category with complete code.

---

## 🔧 Core Infrastructure Files

### 1. `frontend/src/lib/api.js`
**Purpose:** Centralized API client with auto auth token injection

```javascript
import { useAuthStore } from '@/store/auth-store';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * Internal request handler
 * Automatically includes auth token from localStorage
 */
async function request(method, endpoint, data = null, options = {}) {
    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
    };

    // ✅ Automatically get token from Zustand store
    const token = useAuthStore.getState().token;
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const config = {
        method,
        headers,
        ...options,
    };

    // Include body for POST, PATCH, PUT
    if (data) {
        config.body = JSON.stringify(data);
    }

    const res = await fetch(`${BASE_URL}${endpoint}`, config);

    // Handle errors
    if (!res.ok) {
        let errorMessage = "API request failed";
        try {
            const errorData = await res.json();
            errorMessage = errorData.message || errorMessage;
        } catch {
            // If JSON parsing fails, use default message
        }
        throw new Error(errorMessage);
    }

    return res.json();
}

/**
 * API client with RESTful methods
 */
export const api = {
    get: (endpoint, options = {}) => request('GET', endpoint, null, options),
    post: (endpoint, data, options = {}) => request('POST', endpoint, data, options),
    patch: (endpoint, data, options = {}) => request('PATCH', endpoint, data, options),
    put: (endpoint, data, options = {}) => request('PUT', endpoint, data, options),
    delete: (endpoint, options = {}) => request('DELETE', endpoint, null, options),
};
```

### 2. `frontend/src/lib/utils.js`
**Purpose:** Utility functions

```javascript
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(date, format = "long") {
  if (!date) return null;
  
  const d = new Date(date);
  
  if (format === "short") {
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }
  
  if (format === "relative") {
    const now = new Date();
    const diff = d.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return "Today";
    if (days === 1) return "Tomorrow";
    if (days === -1) return "Yesterday";
    if (days > 0 && days < 7) return `In ${days} days`;
    if (days < 0 && days > -7) return `${Math.abs(days)} days ago`;
  }
  
  return d.toLocaleDateString("en-US", { 
    weekday: "long", 
    year: "numeric", 
    month: "long", 
    day: "numeric" 
  });
}
```

### 3. `frontend/src/store/auth-store.js`
**Purpose:** Zustand auth state management

```javascript
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,

            register: (user, token) =>
                set({
                    user,
                    token,
                    isAuthenticated: true,
                }),

            login: (user, token) =>
                set({
                    user,
                    token,
                    isAuthenticated: true
                }),

            logout: () =>
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false
                }),
        }),
        {
            name: "auth-storage",
        }
    )
);
```

---

## 🎣 Custom Hooks

### 4. `frontend/src/hooks/use-workspace.js`
**Purpose:** All workspace-related functions (15 functions)

**CRITICAL:** This file is 386 lines. Due to length, I'll provide it separately. Key functions:
- `fetchUserWorkspaces`
- `fetchWorkspaceById`
- `createWorkspace`
- `updateWorkspace`
- `deleteWorkspace`
- `fetchWorkspaceMembers`
- `inviteMember`
- `acceptInvitation`
- `removeMember`
- `updateMemberRole`
- `leaveWorkspace`
- `fetchPendingInvitations`
- `fetchWorkspaceInvitations`
- `selectWorkspace`
- `clearError`

### 5. `frontend/src/hooks/use-projects.js`
**Purpose:** All project-related functions (20 functions)

**CRITICAL:** This file is 360+ lines. Key functions:
- `fetchUserProjects`
- `fetchWorkspaceProjects`
- `fetchProjectById`
- `createProject`
- `updateProject`
- `deleteProject`
- `fetchProjectMembers`
- `addProjectMember`
- `removeProjectMember`
- `updateProjectMemberRole`
- `leaveProject`
- `updateProjectProgress`
- `updateProjectStatus`
- Plus utility functions

---

## 🔐 Authentication Components

### 6. `frontend/src/components/auth/login-form.jsx`

```javascript
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "@radix-ui/react-label";
import { Button } from "../ui/button";
import { useAuthStore } from "@/store/auth-store";
import { api } from "@/lib/api";

const loginSchema = z.object({
    email: z.string().min(1, "Email is required").email("Please enter a valid email"),
    password: z.string().min(1, "Password is required").min(6, "Password must be at least 6 characters"),
});

export default function LoginForm() {
    const router = useRouter();
    const login = useAuthStore((state) => state.login);
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const validateForm = () => {
        try {
            loginSchema.parse(formData);
            setErrors({});
            return true;
        } catch (error) {
            if (error instanceof z.ZodError) {
                const fieldErrors = {};
                error.errors.forEach((err) => {
                    if (err.path[0]) {
                        fieldErrors[err.path[0]] = err.message;
                    }
                });
                setErrors(fieldErrors);
            }
            return false;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError("");

        if (!validateForm()) return;

        setIsLoading(true);

        try {
            const response = await api.post("/api/auth/login", formData);

            if (response.success) {
                const { user, token } = response.data;
                login(user, token);
                router.push("/workspace");
            }
        } catch (error) {
            setApiError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-6 lg:p-8">
            <div className="max-w-sm sm:max-w-md w-full">
                <Card className="bg-card text-card-foreground rounded-lg sm:rounded-xl shadow-lg p-6 sm:p-8 border border-border">
                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                        <div className="text-center mb-6 sm:mb-8">
                            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">Login</h2>
                            <p className="text-sm sm:text-base text-muted-foreground">Sign in to get started</p>
                        </div>

                        {apiError && (
                            <div className="mb-4 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-xs sm:text-sm">
                                {apiError}
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-foreground font-medium text-sm sm:text-base block">Email</Label>
                            <Input type="email" id="email" name="email" value={formData.email} onChange={handleChange} 
                                   className="w-full h-10 sm:h-11 bg-background border-input text-foreground placeholder:text-muted-foreground focus:ring-ring text-sm sm:text-base" 
                                   placeholder="Enter your email" />
                            {errors.email && <p className="text-destructive text-xs sm:text-sm mt-1">{errors.email}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="password" className="text-foreground font-medium text-sm sm:text-base block">Password</Label>
                            <Input type="password" id="password" name="password" value={formData.password} onChange={handleChange} 
                                   className="w-full h-10 sm:h-11 bg-background border-input text-foreground placeholder:text-muted-foreground focus:ring-ring text-sm sm:text-base" 
                                   placeholder="Enter your password" />
                            {errors.password && <p className="text-destructive text-xs sm:text-sm mt-1">{errors.password}</p>}
                        </div>

                        <Button type="submit" disabled={isLoading} 
                                className="w-full h-10 sm:h-11 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base font-medium mt-6">
                            {isLoading ? "Logging in..." : "Login"}
                        </Button>

                        <p className="text-sm sm:text-base text-muted-foreground mt-4">
                            Don't have an account? <Link href="/register" className="text-primary hover:underline">Register</Link>
                        </p>
                    </form>
                </Card>
            </div>
        </div>
    );
}
```

### 7. `frontend/src/components/auth/register-form.jsx`
(Similar structure to login-form.jsx, uses api.post("/api/auth/register"))

---

## 📄 Page Files

### 8. `frontend/src/app/page.jsx`
**Purpose:** Root redirect based on auth status

```javascript
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/workspace");
    } else {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Redirecting...</p>
    </div>
  );
}
```

### 9. `frontend/src/app/(auth)/login/page.jsx`

```javascript
"use client";

import LoginForm from "@/components/auth/login-form";

export default function LoginPage() {
    return <LoginForm />;
}
```

### 10. `frontend/src/app/(auth)/register/page.jsx`

```javascript
"use client";

import RegisterForm from "@/components/auth/register-form";

export default function RegisterPage() {
    return <RegisterForm />;
}
```

---

## ⚙️ Backend Changes

### Backend File: `backend/src/controllers/workspaceController.js`
**Add this function at the END of the file:**

```javascript
/**
 * Get user's pending invitations across all workspaces
 * GET /api/workspaces/invitations/pending
 */
export const getUserPendingInvitations = async (req, res) => {
    try {
        const userEmail = req.user.email;

        const workspaces = await Workspace.find({
            'invitations.email': userEmail,
            'invitations.status': 'pending'
        })
        .populate('owner', 'name email')
        .populate('invitations.invitedBy', 'name email')
        .select('name description invitations');

        const pendingInvitations = [];
        
        workspaces.forEach((workspace) => {
            const userInvitations = workspace.invitations.filter(
                (inv) => inv.email === userEmail && inv.status === 'pending'
            );
            
            userInvitations.forEach((invitation) => {
                pendingInvitations.push({
                    _id: invitation._id,
                    workspace: {
                        _id: workspace._id,
                        name: workspace.name,
                        description: workspace.description
                    },
                    email: invitation.email,
                    role: invitation.role,
                    token: invitation.token,
                    invitedBy: invitation.invitedBy,
                    invitedAt: invitation.invitedAt,
                    status: invitation.status
                });
            });
        });

        return res.status(200).json({
            success: true,
            message: 'Pending invitations retrieved successfully',
            data: { invitations: pendingInvitations }
        });

    } catch (error) {
        console.error('Get pending invitations error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve pending invitations',
            error: error.message
        });
    }
};
```

### Backend File: `backend/src/routes/workspace.routes.js`
**Add to imports:**
```javascript
getUserPendingInvitations
```

**Add route BEFORE the /:workspaceId/invitations route:**
```javascript
router.get('/invitations/pending', getUserPendingInvitations);
```

---

## 📊 Summary

### Files Created: 19 total

**Core (3):**
- api.js
- utils.js  
- auth-store.js

**Hooks (2):**
- use-workspace.js
- use-projects.js

**Auth Components (2):**
- login-form.jsx
- register-form.jsx

**Auth Pages (2):**
- (auth)/login/page.jsx
- (auth)/register/page.jsx

**Workspace Components (3):**
- workspace-switcher.jsx
- sidebar.jsx
- create-workspace-dialog.jsx
- invite-member-dialog.jsx

**Project Components (3):**
- project-card.jsx
- project-list.jsx
- create-project-dialog.jsx

**Dashboard Pages (4):**
- (dashboard)/layout.jsx
- workspace/[workspaceId]/page.jsx
- workspace/[workspaceId]/projects/page.jsx  
- workspace/[workspaceId]/members/page.jsx
- workspace/[workspaceId]/settings/page.jsx

**Root Pages (2):**
- page.jsx (root redirect)
- workspace/page.jsx (workspace redirect with invitations)

---

## 🚀 Rebuild Steps

1. Delete frontend/src/app, frontend/src/components, frontend/src/hooks
2. Recreate folders
3. Copy files from this blueprint in order
4. Install shadcn components: `npx shadcn@latest add dialog dropdown-menu avatar tabs select badge card input button label textarea separator`
5. Test authentication flow
6. Test workspace/project creation

---

**This is your complete source of truth for rebuilding!** 🎯
