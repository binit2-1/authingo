import { createAuthClient } from "@authingo/react";

const baseURL =
    process.env.NEXT_PUBLIC_AUTHINGO_BASE_URL ?? "http://localhost:8080/api/auth";

// Initialize the client pointing to your Go backend port
export const authClient = createAuthClient({
    baseURL
})

// Export the hooks for your UI to use
export const {signIn, signUp, signOut, useSession} = authClient;
