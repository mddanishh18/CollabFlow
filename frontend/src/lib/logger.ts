// Production-safe logger utility
// Only logs in development, silent in production

const isDev = process.env.NODE_ENV === 'development';

export const logger = {
    log: (...args: any[]) => {
        if (isDev) {
            console.log(...args);
        }
    },

    error: (...args: any[]) => {
        // Only log errors in development to keep production console clean
        if (isDev) {
            console.error(...args);
        }
    },

    warn: (...args: any[]) => {
        if (isDev) {
            console.warn(...args);
        }
    },

    info: (...args: any[]) => {
        if (isDev) {
            console.info(...args);
        }
    },

    debug: (...args: any[]) => {
        if (isDev) {
            console.debug(...args);
        }
    }
};
