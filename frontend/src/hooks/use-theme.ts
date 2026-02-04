import { useEffect, useState } from "react";
import { useTheme as useNextTheme } from "next-themes";

// ===== Theme Types =====
type Theme = 'light' | 'dark' | 'system';

interface UseThemeReturn {
    // Original next-themes values
    theme: string | undefined;
    setTheme: (theme: string) => void;
    systemTheme: string | undefined;
    resolvedTheme: string | undefined;
    // Additional utilities
    currentTheme: string | undefined;
    isDark: boolean;
    mounted: boolean;
    toggleTheme: () => void;
    cycleTheme: () => void;
    getThemeIcon: () => string;
    getThemeLabel: () => string;
    themes: Theme[];
}

/**
 * Custom theme hook with additional utilities
 * Wraps next-themes with app-specific functionality
 */
export const useTheme = (): UseThemeReturn => {
    const { theme, setTheme, systemTheme, resolvedTheme } = useNextTheme();
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    // Get the actual current theme (resolves 'system' to actual theme)
    const currentTheme = theme === "system" ? systemTheme : theme;

    // Check if dark mode is active
    const isDark = currentTheme === "dark";

    // Toggle between light and dark
    const toggleTheme = (): void => {
        setTheme(isDark ? "light" : "dark");
    };

    // Cycle through all themes
    const cycleTheme = (): void => {
        if (theme === "light") setTheme("dark");
        else if (theme === "dark") setTheme("system");
        else setTheme("light");
    };

    // Get theme icon
    const getThemeIcon = (): string => {
        if (!mounted) return "🌓";
        switch (currentTheme) {
            case "dark":
                return "🌙";
            case "light":
                return "☀️";
            default:
                return "💻";
        }
    };

    // Get theme label
    const getThemeLabel = (): string => {
        if (!mounted) return "Loading...";
        switch (theme) {
            case "dark":
                return "Dark";
            case "light":
                return "Light";
            case "system":
                return "System";
            default:
                return "Auto";
        }
    };

    return {
        // Original next-themes values
        theme,
        setTheme,
        systemTheme,
        resolvedTheme,

        // Additional utilities
        currentTheme,
        isDark,
        mounted,
        toggleTheme,
        cycleTheme,
        getThemeIcon,
        getThemeLabel,

        // Theme options
        themes: ["light", "dark", "system"],
    };
};
