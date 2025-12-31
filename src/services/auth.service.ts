import api from '@/lib/api';

export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthResponse {
    access_token: string;
    refresh_token: string;
    company: string;
}

export const authService = {
    login: async (data: LoginRequest) => {
        const response = await api.post<AuthResponse>('/auth/login', data);
        return response.data;
    },
    refresh: async (refresh_token: string) => {
        // Create a new axios instance to avoid interceptor loop or just use api but be careful?
        // Better to use a clean instance or skip interceptor. 
        // Or just allow it, but if it fails with 401 it will trigger interceptor again...
        // We can use a direct axios call here to be safe and avoid circular dependencies if we imported api.
        // But we imported api.
        // Let's use api.post but we need to handle the loop in api.ts
        const response = await api.post<AuthResponse>('/auth/refresh', { refresh_token });
        return response.data;
    },
    logout: async () => {
        await api.post('/auth/logout');
    },
};
