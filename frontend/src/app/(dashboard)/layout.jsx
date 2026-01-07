"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { useWorkspace } from "@/hooks/use-workspace";
import { Sidebar } from "@/components/workspace/sidebar";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({ children }) {
    const router = useRouter();
    const params = useParams();
    const workspaceId = params?.workspaceId;
    const { isAuthenticated, _hasHydrated } = useAuthStore();
    const { fetchWorkspaceById, currentWorkspace } = useWorkspace();

    useEffect(() => {
        // Only redirect after hydration is complete
        if (_hasHydrated && !isAuthenticated) {
            router.push("/login");
        }
    }, [isAuthenticated, _hasHydrated, router]);

    // Fetch workspace details when workspaceId changes
    useEffect(() => {
        if (_hasHydrated && isAuthenticated && workspaceId) {
            // Only fetch if we don't have the workspace or it's a different one
            if (!currentWorkspace || currentWorkspace._id !== workspaceId) {
                fetchWorkspaceById(workspaceId).catch(err => {
                    console.error('Failed to fetch workspace:', err);
                });
            }
        }
    }, [workspaceId, _hasHydrated, isAuthenticated]);

    // Show loading while hydrating from localStorage
    if (!_hasHydrated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background to-muted/20">
                <div className="text-center space-y-4">
                    <Loader2 className="h-8 w-8 md:h-10 md:w-10 animate-spin text-primary mx-auto" />
                    <p className="text-sm text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Mobile: Hidden sidebar, Desktop: Visible */}
            <div className="hidden md:flex">
                <Sidebar />
            </div>

            {/* Main content area */}
            <main className="flex-1 overflow-y-auto bg-background">
                {children}
            </main>
        </div>
    );
}
