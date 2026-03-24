import { Skeleton } from "@/components/ui/skeleton"

export default function WorkspaceLoading() {
    return (
        <div className="flex-1 p-4 md:p-6 lg:p-8">
            <div className="space-y-6">
                {/* Header */}
                <div className="space-y-2 pl-12 md:pl-0">
                    <Skeleton className="h-8 w-56" />
                    <Skeleton className="h-4 w-80" />
                </div>

                {/* Stats cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {[0, 1, 2].map((i) => (
                        <Skeleton key={i} className="h-32 rounded-lg" />
                    ))}
                </div>

                {/* Content panels */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Skeleton className="h-64 rounded-lg" />
                    <Skeleton className="h-64 rounded-lg" />
                </div>
            </div>
        </div>
    )
}
