"use client"

import { useEffect, ReactNode, useState } from "react"
import { useRouter, useParams, usePathname } from "next/navigation"
import { useAuthStore } from "@/store/auth-store"
import { useWorkspace } from "@/hooks/use-workspace"
import { Sidebar } from "@/components/workspace/sidebar"
import { MobileNav } from "@/components/workspace/mobile-nav"
import { PageTransition } from "@/components/ui/page-transition"
import { NavigationProgress } from "@/hooks/use-page-transition"
import { Loader2 } from "lucide-react"

export default function DashboardLayout({ children }: { children: ReactNode }) {
    const router = useRouter()
    const params = useParams()
    const pathname = usePathname()
    const workspaceId = params?.workspaceId as string | undefined
    const { isAuthenticated, _hasHydrated } = useAuthStore()
    const { fetchWorkspaceById, currentWorkspace } = useWorkspace()
    const [isNavigating, setIsNavigating] = useState(false)

    // Track route changes for navigation progress
    useEffect(() => {
        setIsNavigating(true)
        const timer = setTimeout(() => setIsNavigating(false), 500)
        return () => clearTimeout(timer)
    }, [pathname])

    useEffect(() => {
        // Only redirect after hydration is complete
        if (_hasHydrated && !isAuthenticated) {
            router.push("/login")
        }
    }, [isAuthenticated, _hasHydrated, router])

    // Fetch workspace details when workspaceId changes
    useEffect(() => {
        if (_hasHydrated && isAuthenticated && workspaceId) {
            // Only fetch if we don't have the workspace or it's a different one
            if (!currentWorkspace || currentWorkspace._id !== workspaceId) {
                fetchWorkspaceById(workspaceId).catch((err) => {
                    console.error("Failed to fetch workspace:", err)
                })
            }
        }
        // Note: currentWorkspace is intentionally excluded to prevent infinite loops
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [workspaceId, _hasHydrated, isAuthenticated])

    // Show loading while hydrating from localStorage
    if (!_hasHydrated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30">
                <div className="text-center space-y-4">
                    <div className="relative">
                        <div className="absolute inset-0 animate-ping opacity-20">
                            <Loader2 className="h-10 w-10 text-primary mx-auto" />
                        </div>
                        <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto relative z-10" />
                    </div>
                    <p className="text-sm text-muted-foreground font-medium tracking-wide">Loading workspace...</p>
                </div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return null
    }


    return (
        <div className="flex h-screen overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
            {/* Top progress bar for route changes */}
            <NavigationProgress isNavigating={isNavigating} />

            {/* Mobile navigation - visible only on mobile */}
            <MobileNav />

            {/* Desktop sidebar - hidden on mobile */}
            <div className="hidden md:flex">
                <Sidebar />
            </div>

            {/* Main content area with smooth transitions */}
            <main className="flex-1 overflow-y-auto bg-background/50 backdrop-blur-3xl">
                <PageTransition>{children}</PageTransition>
            </main>
        </div>
    )
}
