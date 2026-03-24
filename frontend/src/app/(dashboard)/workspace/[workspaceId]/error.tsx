"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, RefreshCw } from "lucide-react"

interface ErrorProps {
    error: Error & { digest?: string }
    reset: () => void
}

export default function WorkspaceError({ error, reset }: ErrorProps) {
    useEffect(() => {
        console.error("Workspace error:", error)
    }, [error])

    return (
        <div className="flex-1 p-4 md:p-6 lg:p-8 flex items-start justify-center pt-16">
            <Card className="max-w-md w-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                        <AlertCircle className="h-5 w-5" />
                        Something went wrong
                    </CardTitle>
                    <CardDescription>
                        {error.message || "Failed to load this workspace page."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={reset} className="w-full">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Try again
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
