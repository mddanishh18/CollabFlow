import { Skeleton } from "@/components/ui/skeleton"

export default function ChatLoading() {
    return (
        <div className="flex h-full">
            {/* Channel list sidebar */}
            <div className="hidden md:flex flex-col w-60 border-r p-3 space-y-2">
                <Skeleton className="h-8 w-full rounded-md" />
                <div className="space-y-1 pt-2">
                    {[0, 1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-center gap-2 px-2 py-1.5">
                            <Skeleton className="h-4 w-4 rounded" />
                            <Skeleton className="h-4 w-28" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Message area */}
            <div className="flex-1 flex flex-col">
                {/* Chat header */}
                <div className="border-b p-4 flex items-center gap-3">
                    <Skeleton className="h-5 w-5" />
                    <Skeleton className="h-5 w-32" />
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 space-y-4">
                    {[0, 1, 2, 3, 4].map((i) => (
                        <div key={i} className={`flex gap-3 ${i % 3 === 2 ? "flex-row-reverse" : ""}`}>
                            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                            <div className="space-y-1 max-w-xs">
                                <Skeleton className="h-3 w-20" />
                                <Skeleton className={`h-10 rounded-lg ${i % 2 === 0 ? "w-56" : "w-40"}`} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input */}
                <div className="border-t p-4">
                    <Skeleton className="h-10 w-full rounded-md" />
                </div>
            </div>
        </div>
    )
}
