import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";

// Cookie helpers — keep the auth-token cookie in sync with Zustand so that
// Next.js middleware can protect routes server-side without waiting for hydration.
const AUTH_COOKIE = "auth-token"
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

function setAuthCookie(token: string) {
    if (typeof document === "undefined") return
    document.cookie = `${AUTH_COOKIE}=${token}; path=/; SameSite=Lax; max-age=${COOKIE_MAX_AGE}`
}

function clearAuthCookie() {
    if (typeof document === "undefined") return
    document.cookie = `${AUTH_COOKIE}=; path=/; SameSite=Lax; max-age=0`
}

// ===== Auth Store State & Actions =====
interface AuthState {
    // State
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    _hasHydrated: boolean;

    // Actions
    register: (user: User, token: string) => void;
    login: (user: User, token: string) => void;
    logout: () => void;
    setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            // Initial State
            user: null,
            token: null,
            isAuthenticated: false,
            _hasHydrated: false,

            // Actions
            register: (user: User, token: string) => {
                setAuthCookie(token)
                set({ user, token, isAuthenticated: true })
            },

            login: (user: User, token: string) => {
                setAuthCookie(token)
                set({ user, token, isAuthenticated: true })
            },

            logout: () => {
                clearAuthCookie()
                set({ user: null, token: null, isAuthenticated: false })
            },

            setHasHydrated: (state: boolean) => {
                set({ _hasHydrated: state });
            },
        }),
        {
            name: "auth-storage",
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
    )
);
