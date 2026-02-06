import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes
 * Combines clsx and tailwind-merge for proper class merging
 */
export function cn(...inputs: ClassValue[]): string {
    return twMerge(clsx(inputs));
}

// ===== Date Format Types =====
type DateFormat = 'short' | 'long' | 'relative';

/**
 * Format a date with various format options
 * @param date - Date to format (Date object, string, or null)
 * @param format - Format type: 'short', 'long', or 'relative'
 * @returns Formatted date string or null
 */
export function formatDate(date: Date | string | null | undefined, format: DateFormat = "long"): string | null {
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

/**
 * Capitalize the first letter of a string
 */
export function capitalize(str: string): string {
    if (!str || typeof str !== 'string') return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Truncate a string to a specified length
 */
export function truncate(str: string, length: number): string {
    if (!str) return '';
    if (str.length <= length) return str;
    return str.slice(0, length) + '...';
}

/**
 * Generate a random color hex code
 */
export function randomColor(): string {
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

/**
 * Check if a value is a valid email
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
