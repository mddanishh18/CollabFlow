import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export function formatDate(date, format = "long") {
    if (!date) return null;

    const d = new Date(date);

    if (format === "short") {
        return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    }

    if (format === "relative") {
        const now = new Date();
        const diff = d.getTime() - now.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) return "Today";
        if (days === 1) return "Tomorrow";
        if (days === -1) return "Yesterday";
        if (days > 0 && days < 7) return `In ${days} days`;
        if (days < 0 && days > -7) return `${Math.abs(days)} days ago`;
    }

    return d.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    });
}
