import { type AuthError } from "./types";

interface FetchOptions extends RequestInit {
    baseURL: string;
}

export async function request<T>(endpoint: string, options: FetchOptions): Promise<{ data: T | null; error: AuthError | null }> {
    return requestWithRefresh<T>(endpoint, options, true);
}

async function requestWithRefresh<T>(endpoint: string, options: FetchOptions, allowRefresh: boolean): Promise<{ data: T | null; error: AuthError | null }> {
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
            if (allowRefresh && response.status === 401 && endpoint === "/session") {
                const refreshed = await fetch(`${options.baseURL}/refresh`, {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Authingo-Client": "true",
                    },
                });

                if (refreshed.ok) {
                    return requestWithRefresh<T>(endpoint, options, false);
                }

                if (typeof window !== "undefined") {
                    window.dispatchEvent(new CustomEvent("authingo:logout"));
                }
            }
            return { data: null, error: { message: errMessage || "An error occurred" } };
        }

        const data = await response.json();
        return { data, error: null };
    } catch (err: any) {
        return { data: null, error: { message: err.message || "Network error" } };
    }
}
