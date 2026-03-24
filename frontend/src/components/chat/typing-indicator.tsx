"use client";

import { motion, useReducedMotion } from "framer-motion";

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

    const prefersReducedMotion = useReducedMotion();
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
                {[0, 1, 2].map((index) => (
                    <motion.span
                        key={index}
                        className="w-2 h-2 bg-muted-foreground/60 rounded-full inline-block"
                        animate={prefersReducedMotion ? {} : { y: [0, -5, 0] }}
                        transition={{
                            duration: 0.9,
                            repeat: Infinity,
                            repeatType: "loop",
                            ease: [0.4, 0, 0.6, 1],
                            delay: index * 0.18,
                        }}
                    />
                ))}
            </div>
            <span>{displayText}</span>
        </div>
    );
}
