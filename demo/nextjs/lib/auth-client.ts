import { createAuthClient } from "@authingo/react";


// Initialize the client pointing to your Go backend port
export const authClient = createAuthClient({
    baseURL: "http://localhost:8080/api/auth"
})

// Export the hooks for your UI to use
export const {signIn, signUp, signOut, useSession} = authClient;