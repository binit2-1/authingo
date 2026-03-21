export interface User{
    id: string;
    email: string;
    name: string;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface Session {
    id: string;
    userId: string;
    token: string;
    expiresAt: string;
    createdAt: string;
}

export interface AuthResponse{
    user: User;
    session?: Session;
}

export interface AuthError{
    message: String;
}
