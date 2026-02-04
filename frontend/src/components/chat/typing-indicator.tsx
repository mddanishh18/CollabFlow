"use client";

interface TypingIndicatorProps {
    users: Array<{
        userId: string;
        user: {
            _id: string;
            name: string;
            avatar?: string | null;
        };
    }>;
}

export function TypingIndicator({ users }: TypingIndicatorProps) {
    if (users.length === 0) return null;

    const userNames = users.map((u) => u.user.name);
    
    let displayText = "";
    if (users.length === 1) {
        displayText = `${userNames[0]} is typing...`;
    } else if (users.length === 2) {
        displayText = `${userNames[0]} and ${userNames[1]} are typing...`;
    } else {
        displayText = `${userNames[0]} and ${users.length - 1} others are typing...`;
    }

    return (
        <div className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground">
            <div className="flex gap-1">
                <span
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: "0ms", animationDuration: "1s" }}
                />
                <span
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: "150ms", animationDuration: "1s" }}
                />
                <span
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: "300ms", animationDuration: "1s" }}
                />
            </div>
            <span>{displayText}</span>
        </div>
    );
}
