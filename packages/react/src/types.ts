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
    token: string;
    created_at: string;
    expires_at: string;
}

export interface AuthResponse {
    user: User;
    session?: Session;
}

export interface AuthError {
    message: string; 
}