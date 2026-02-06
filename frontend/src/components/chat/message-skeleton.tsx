import { Skeleton } from "@/components/ui/skeleton"

export function MessageSkeleton() {
    return (
        <div className="space-y-6 p-6">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-3 animate-in fade-in-50" style={{ animationDelay: `${i * 100}ms` }}>
                    {/* Avatar */}
                    <Skeleton className="h-10 w-10 rounded-full shrink-0" />

                    {/* Message content */}
                    <div className="flex-1 space-y-2">
                        {/* Name and timestamp */}
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-16" />
                        </div>

                        {/* Message bubble */}
                        <Skeleton className="h-20 w-full max-w-md rounded-2xl" />

                        {/* Read status */}
                        <Skeleton className="h-3 w-20" />
                    </div>
                </div>
            ))}
        </div>
    )
}
