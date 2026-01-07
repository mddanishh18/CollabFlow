"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkspace } from "@/hooks/use-workspace";
import { useAuthStore } from "@/store/auth-store";
import { CreateWorkspaceDialog } from "@/components/workspace/create-workspace-dialog";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Mail, CheckCircle, Loader2, Sparkles, AlertCircle, RefreshCw } from "lucide-react";

export default function WorkspaceRedirect() {
    const router = useRouter();
    const { toast } = useToast();
    const { isAuthenticated, _hasHydrated } = useAuthStore();
    const {
        workspaces,
        invitations,
        fetchUserWorkspaces,
        fetchPendingInvitations,
        acceptInvitation,
        loading,
        error
    } = useWorkspace();

    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [acceptingId, setAcceptingId] = useState(null);

    useEffect(() => {
        // Wait for hydration before checking auth
        if (!_hasHydrated) return;

        if (!isAuthenticated) {
            router.push("/login");
            return;
        }

        // Fetch data with error handling
        Promise.all([
            fetchUserWorkspaces(),
            fetchPendingInvitations()
        ]).catch((err) => {
            console.error("Failed to load workspace data:", err);
        });
    }, [isAuthenticated, _hasHydrated]);

    useEffect(() => {
        // Auto-redirect if user has workspaces and no pending invitations
        if (!loading && workspaces.length > 0 && (!invitations || invitations.length === 0)) {
            router.push(`/workspace/${workspaces[0]._id}`);
        }
    }, [workspaces, invitations, loading, router]);

    const handleAcceptInvitation = async (token) => {
        setAcceptingId(token);
        try {
            await acceptInvitation(token);
            await Promise.all([
                fetchUserWorkspaces(),
                fetchPendingInvitations()
            ]);

            toast({
                title: "Invitation accepted! 🎉",
                description: "You've joined the workspace successfully.",
            });
        } catch (err) {
            toast({
                variant: "destructive",
                title: "Failed to accept invitation",
                description: err.message || "Please try again",
            });
        } finally {
            setAcceptingId(null);
        }
    };

    const handleDialogClose = (refresh) => {
        setCreateDialogOpen(false);
        if (refresh) {
            fetchUserWorkspaces();
        }
    };

    const handleRetry = () => {
        Promise.all([
            fetchUserWorkspaces(),
            fetchPendingInvitations()
        ]).catch((err) => {
            toast({
                variant: "destructive",
                title: "Still having issues",
                description: "Please check your connection and try again",
            });
        });
    };

    // Error state with retry
    if (error && !loading) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-background via-background to-muted/20">
                <Card className="max-w-md w-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-destructive">
                            <AlertCircle className="h-5 w-5" />
                            Failed to Load Workspaces
                        </CardTitle>
                        <CardDescription>
                            We couldn't load your workspace data
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>

                        <Button onClick={handleRetry} className="w-full" size="lg">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Retry
                        </Button>

                        <p className="text-xs text-center text-muted-foreground">
                            If the problem persists, please refresh the page or contact support
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Loading state with skeletons
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="max-w-2xl w-full space-y-6">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-4 w-full mt-2" />
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-20 w-full" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-12 space-y-4">
                            <Skeleton className="h-12 w-12 rounded-full mx-auto" />
                            <Skeleton className="h-8 w-64 mx-auto" />
                            <Skeleton className="h-4 w-96 mx-auto" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    const hasPendingInvitations = invitations && invitations.length > 0;
    const hasNoWorkspaces = workspaces.length === 0;

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-background via-background to-muted/20 relative">
            {/* Floating Theme Toggle */}
            <div className="fixed top-4 right-4 z-50">
                <ThemeToggle />
            </div>

            <div className="max-w-2xl w-full space-y-6">

                {/* Pending Invitations */}
                {hasPendingInvitations && (
                    <Card className="border-primary/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Mail className="h-5 w-5 text-primary" />
                                Pending Invitations
                            </CardTitle>
                            <CardDescription>
                                You've been invited to join these workspaces
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {invitations.map((invitation) => (
                                <div
                                    key={invitation._id}
                                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border rounded-lg hover:border-primary/50 transition-colors"
                                >
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-base md:text-lg truncate">
                                            {invitation.workspace?.name || "Workspace"}
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-2 mt-1">
                                            <Badge variant="outline" className="text-xs">
                                                {invitation.role}
                                            </Badge>
                                            <span className="text-xs md:text-sm text-muted-foreground truncate">
                                                Invited by {invitation.invitedBy?.name || "someone"}
                                            </span>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => handleAcceptInvitation(invitation.token)}
                                        disabled={acceptingId === invitation.token}
                                        size="sm"
                                        className="w-full sm:w-auto"
                                    >
                                        {acceptingId === invitation.token ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Accepting...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                Accept
                                            </>
                                        )}
                                    </Button>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}

                {/* Welcome / No Workspaces */}
                {hasNoWorkspaces && (
                    <Card className="border-2 border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-12 md:py-16 px-4 md:px-6 text-center">
                            <div className="rounded-full bg-primary/10 p-3 md:p-4 mb-4">
                                <Sparkles className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                            </div>

                            <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome to CollabFlow!</h1>

                            <p className="text-sm md:text-base text-muted-foreground mb-6 max-w-md">
                                {hasPendingInvitations
                                    ? "Accept an invitation above or create your own workspace to get started"
                                    : "Create your first workspace to start collaborating with your team"}
                            </p>

                            <Button onClick={() => setCreateDialogOpen(true)} size="lg">
                                <Plus className="mr-2 h-5 w-5" />
                                Create Your First Workspace
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>

            <CreateWorkspaceDialog
                open={createDialogOpen}
                onClose={handleDialogClose}
            />
        </div>
    );
}
