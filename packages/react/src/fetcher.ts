import { type AuthError } from "./types";

interface FetchOptions extends RequestInit {
    baseURL: string;
}

export async function request<T>(endpoint: string, options: FetchOptions): Promise<{ data: T | null; error: AuthError | null }> {
    try {
        const response = await fetch(`${options.baseURL}${endpoint}`, {
            ...options,
            credentials: 'include',
            headers: {
                "Content-Type": "application/json",
                "X-Authingo-Client": "true", 
                ...options.headers
            },
        });

        if (!response.ok) {
            const errMessage = await response.text();
            return { data: null, error: { message: errMessage || "An error occurred" } };
        }

        const data = await response.json();
        return { data, error: null };
    } catch (err: any) {
        return { data: null, error: { message: err.message || "Network error" } };
    }
}