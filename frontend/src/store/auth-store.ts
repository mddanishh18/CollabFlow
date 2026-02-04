import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";

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
            register: (user: User, token: string) =>
                set({
                    user,
                    token,
                    isAuthenticated: true,
                }),

            login: (user: User, token: string) =>
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
