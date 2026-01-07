# Authentication System - Complete Files Reference

This document contains ONLY the authentication-related files with their COMPLETE, EXACT code that you can copy-paste.

---

## FILE 1: `frontend/src/lib/api.js`

```javascript
import { useAuthStore } from '@/store/auth-store';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function request(method, endpoint, data = null, options = {}) {
    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
    };

    const token = useAuthStore.getState().token;
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const config = {
        method,
        headers,
        ...options,
    };

    if (data) {
        config.body = JSON.stringify(data);
    }

    const res = await fetch(`${BASE_URL}${endpoint}`, config);

    if (!res.ok) {
        let errorMessage = "API request failed";
        try {
            const errorData = await res.json();
            errorMessage = errorData.message || errorMessage;
        } catch {
        }
        throw new Error(errorMessage);
    }

    return res.json();
}

export const api = {
    get: (endpoint, options = {}) => request('GET', endpoint, null, options),
    post: (endpoint, data, options = {}) => request('POST', endpoint, data, options),
    patch: (endpoint, data, options = {}) => request('PATCH', endpoint, data, options),
    put: (endpoint, data, options = {}) => request('PUT', endpoint, data, options),
    delete: (endpoint, options = {}) => request('DELETE', endpoint, null, options),
};
```

---

## FILE 2: `frontend/src/store/auth-store.js`

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

## FILE 3: `frontend/src/components/auth/login-form.jsx`

```javascript
"use client";

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
                            <Input 
                                type="email" 
                                id="email" 
                                name="email" 
                                value={formData.email} 
                                onChange={handleChange} 
                                className="w-full h-10 sm:h-11 bg-background border-input text-foreground placeholder:text-muted-foreground focus:ring-ring text-sm sm:text-base" 
                                placeholder="Enter your email" 
                            />
                            {errors.email && <p className="text-destructive text-xs sm:text-sm mt-1">{errors.email}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="password" className="text-foreground font-medium text-sm sm:text-base block">Password</Label>
                            <Input 
                                type="password" 
                                id="password" 
                                name="password" 
                                value={formData.password} 
                                onChange={handleChange} 
                                className="w-full h-10 sm:h-11 bg-background border-input text-foreground placeholder:text-muted-foreground focus:ring-ring text-sm sm:text-base" 
                                placeholder="Enter your password" 
                            />
                            {errors.password && <p className="text-destructive text-xs sm:text-sm mt-1">{errors.password}</p>}
                        </div>

                        <Button 
                            type="submit" 
                            disabled={isLoading} 
                            className="w-full h-10 sm:h-11 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base font-medium mt-6"
                        >
                            {isLoading ? "Logging in..." : "Login"}
                        </Button>

                        <p className="text-sm sm:text-base text-muted-foreground mt-4 text-center">
                            Don't have an account?{" "}
                            <Link href="/register" className="text-primary hover:underline">
                                Register
                            </Link>
                        </p>
                    </form>
                </Card>
            </div>
        </div>
    );
}
```

---

## FILE 4: `frontend/src/components/auth/register-form.jsx`

```javascript
"use client";

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

const registerSchema = z.object({
    name: z.string().min(1, "Name is required").min(2, "Name must be at least 2 characters"),
    email: z.string().min(1, "Email is required").email("Please enter a valid email"),
    password: z.string().min(1, "Password is required").min(6, "Password must be at least 6 characters"),
});

export default function RegisterForm() {
    const router = useRouter();
    const register = useAuthStore((state) => state.register);
    const [formData, setFormData] = useState({ name: "", email: "", password: "" });
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
            registerSchema.parse(formData);
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
            const response = await api.post("/api/auth/register", formData);

            if (response.success) {
                const { user, token } = response.data;
                register(user, token);
                router.push("/workspace");
            }
        } catch (error) {
            setApiError(error.message || "Registration failed. Please try again.");
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
                            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">Register</h2>
                            <p className="text-sm sm:text-base text-muted-foreground">Create your account to get started</p>
                        </div>

                        {apiError && (
                            <div className="mb-4 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-xs sm:text-sm">
                                {apiError}
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <Label htmlFor="name" className="text-foreground font-medium text-sm sm:text-base block">Name</Label>
                            <Input 
                                type="text" 
                                id="name" 
                                name="name" 
                                value={formData.name} 
                                onChange={handleChange} 
                                className="w-full h-10 sm:h-11 bg-background border-input text-foreground placeholder:text-muted-foreground focus:ring-ring text-sm sm:text-base" 
                                placeholder="Enter your name" 
                            />
                            {errors.name && <p className="text-destructive text-xs sm:text-sm mt-1">{errors.name}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-foreground font-medium text-sm sm:text-base block">Email</Label>
                            <Input 
                                type="email" 
                                id="email" 
                                name="email" 
                                value={formData.email} 
                                onChange={handleChange} 
                                className="w-full h-10 sm:h-11 bg-background border-input text-foreground placeholder:text-muted-foreground focus:ring-ring text-sm sm:text-base" 
                                placeholder="Enter your email" 
                            />
                            {errors.email && <p className="text-destructive text-xs sm:text-sm mt-1">{errors.email}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="password" className="text-foreground font-medium text-sm sm:text-base block">Password</Label>
                            <Input 
                                type="password" 
                                id="password" 
                                name="password" 
                                value={formData.password} 
                                onChange={handleChange} 
                                className="w-full h-10 sm:h-11 bg-background border-input text-foreground placeholder:text-muted-foreground focus:ring-ring text-sm sm:text-base" 
                                placeholder="Enter your password" 
                            />
                            {errors.password && <p className="text-destructive text-xs sm:text-sm mt-1">{errors.password}</p>}
                        </div>

                        <Button 
                            type="submit" 
                            disabled={isLoading} 
                            className="w-full h-10 sm:h-11 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base font-medium mt-6"
                        >
                            {isLoading ? "Creating account..." : "Register"}
                        </Button>

                        <p className="text-sm sm:text-base text-muted-foreground mt-4 text-center">
                            Already have an account?{" "}
                            <Link href="/login" className="text-primary hover:underline">
                                Login
                            </Link>
                        </p>
                    </form>
                </Card>
            </div>
        </div>
    );
}
```

---

## FILE 5: `frontend/src/app/(auth)/login/page.jsx`

```javascript
"use client";

import LoginForm from "@/components/auth/login-form";

export default function LoginPage() {
    return <LoginForm />;
}
```

---

## FILE 6: `frontend/src/app/(auth)/register/page.jsx`

```javascript
"use client";

import RegisterForm from "@/components/auth/register-form";

export default function RegisterPage() {
    return <RegisterForm />;
}
```

---

## FILE 7: `frontend/src/app/page.jsx`

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

---

## Summary

**7 files total for authentication:**

1. `lib/api.js` - API client with auto token injection
2. `store/auth-store.js` - Zustand auth state
3. `components/auth/login-form.jsx` - Login form component
4. `components/auth/register-form.jsx` - Register form component
5. `app/(auth)/login/page.jsx` - Login page
6. `app/(auth)/register/page.jsx` - Register page
7. `app/page.jsx` - Root redirect page

**Key points:**
- Uses `api.post()` NOT `api()` function call
- Redirects to `/workspace` after login/register
- Token managed by Zustand, auto-injected by api.js
- No manual `setToken`/`setUser` calls needed

**That's it! These 7 files are all you need for authentication!** 🎯
