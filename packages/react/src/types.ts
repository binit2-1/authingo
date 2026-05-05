export interface User {
    id: string;
    email: string;
    name: string;
    email_verified: boolean;
    created_at: string;
    updated_at: string;
}

export interface Session {
    id: string;
    user_id: string;
    created_at: string;
    expires_at: string;
    refresh_expires_at: string;
}

export interface AuthResponse {
    user: User;
    session?: Session;
}

export interface UseSessionResult {
    data: AuthResponse | null;
    isPending: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export interface AuthError {
    message: string; 
}
