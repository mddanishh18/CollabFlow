import { useAuthStore } from '@/store/auth-store';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ===== Types =====
interface RequestOptions extends Omit<RequestInit, 'body' | 'method'> {
    headers?: Record<string, string>;
}

/**
 * Internal request handler
 * Automatically includes auth token from localStorage
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function request<T = any>(
    method: string,
    endpoint: string,
    data: unknown = null,
    options: RequestOptions = {}
): Promise<T> {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...options.headers,
    };

    // ✅ Automatically get token from Zustand store
    const token = useAuthStore.getState().token;
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const config: RequestInit = {
        method,
        headers,
        ...options,
    };

    // Include body for POST, PATCH, PUT
    if (data) {
        config.body = JSON.stringify(data);
    }

    const res = await fetch(`${BASE_URL}${endpoint}`, config);

    // Handle errors
    if (!res.ok) {
        let errorMessage = "API request failed";
        try {
            const errorData = await res.json();
            errorMessage = errorData.message || errorMessage;
        } catch {
            // If JSON parsing fails, use default message
        }
        const error = new Error(errorMessage) as Error & { response?: { data: { message: string } } };
        error.response = { data: { message: errorMessage } };
        throw error;
    }

    return res.json() as Promise<T>;
}

// ===== API Response Types =====
// These match the backend response structure
interface ApiDataResponse<T> {
    data: T;
    [key: string]: unknown;
}

/**
 * API client with RESTful methods
 * Usage:
 *   api.get('/workspaces')
 *   api.post('/workspaces', { name: 'Test' })
 *   api.patch('/workspaces/123', { name: 'Updated' })
 *   api.delete('/workspaces/123')
 */
export const api = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get: <T = any>(endpoint: string, options: RequestOptions = {}) =>
        request<T>('GET', endpoint, null, options),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    post: <T = any>(endpoint: string, data: unknown, options: RequestOptions = {}) =>
        request<T>('POST', endpoint, data, options),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    patch: <T = any>(endpoint: string, data: unknown, options: RequestOptions = {}) =>
        request<T>('PATCH', endpoint, data, options),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    put: <T = any>(endpoint: string, data: unknown, options: RequestOptions = {}) =>
        request<T>('PUT', endpoint, data, options),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete: <T = any>(endpoint: string, options: RequestOptions = {}) =>
        request<T>('DELETE', endpoint, null, options),
};
