"use client";

import { toast as sonnerToast } from "sonner";

// ===== Toast Types =====
interface ToastOptions {
    title?: string;
    description?: string;
    variant?: 'default' | 'destructive';
    duration?: number;
    [key: string]: unknown;
}

/**
 * Custom useToast hook that wraps sonner for consistent API
 * Provides toast notifications matching the shadcn/ui toast API pattern
 */
export function useToast() {
    const toast = ({ title, description, variant, ...props }: ToastOptions) => {
        if (variant === "destructive") {
            return sonnerToast.error(title, {
                description,
                ...props,
            });
        }

        return sonnerToast.success(title, {
            description,
            ...props,
        });
    };

    return { toast };
}

// Export toast directly for simpler usage
export { sonnerToast as toast };
