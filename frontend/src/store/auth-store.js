import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            _hasHydrated: false,

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

            setHasHydrated: (state) => {
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
