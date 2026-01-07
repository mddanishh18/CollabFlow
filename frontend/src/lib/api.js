import { useAuthStore } from '@/store/auth-store';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * Internal request handler
 * Automatically includes auth token from localStorage
 */
async function request(method, endpoint, data = null, options = {}) {
    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
    };

    // ✅ Automatically get token from Zustand store
    const token = useAuthStore.getState().token;
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const config = {
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
        throw new Error(errorMessage);
    }

    return res.json();
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
    get: (endpoint, options = {}) => request('GET', endpoint, null, options),
    post: (endpoint, data, options = {}) => request('POST', endpoint, data, options),
    patch: (endpoint, data, options = {}) => request('PATCH', endpoint, data, options),
    put: (endpoint, data, options = {}) => request('PUT', endpoint, data, options),
    delete: (endpoint, options = {}) => request('DELETE', endpoint, null, options),
};
