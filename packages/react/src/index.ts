"use client";

import { request } from "./fetcher";
import { type AuthResponse } from "./types";

export interface AuthClientOptions {
    /** * The absolute URL pointing to your Go AuthInGo backend routes.
     * @example "http://localhost:8080/api/auth"
     */
    baseURL: string;
}

/**
 * Initializes the AuthInGo React SDK APIs.
 * This creates a localized instance of the auth client wired to your Go backend,
 * providing fully typed server actions.
 * * @param options - Configuration including your backend baseURL.
 */
export function createAuthClient(options: AuthClientOptions) {
    const { baseURL } = options;

    return {
        /** Core authentication actions for logging in and registering users. */
        signIn: {
            /**
             * Authenticates an existing user via email and password.
             * On success, the Go backend automatically securely sets an HttpOnly session cookie.
             * * @param credentials - An object containing `email` and `password`.
             */
            email: async (credentials: { email: string; password: string }) => {
                return request<AuthResponse>("/sign-in", {
                    baseURL,
                    method: "POST",
                    body: JSON.stringify(credentials)
                });
            }
        },

        signUp: {
            /**
             * Registers a new user and immediately establishes a login session.
             * * @param credentials - An object containing `email`, `password`, and `name`.
             */
            email: async (credentials: { email: string; password: string; name: string }) => {
                return request<AuthResponse>("/sign-up", {
                    baseURL,
                    method: "POST",
                    body: JSON.stringify(credentials)
                });
            }
        },

        /**
         * Terminates the current active session in the database and 
         * instructs the browser to clear the session cookie.
         */
        signOut: async () => {
            return request("/sign-out", {
                baseURL,
                method: "POST",
            });
        }
    }
}

// Export the Global State Provider and Hook
export { AuthProvider, useAuth } from "./AuthProvider";

// Export the types so developers can type their own variables
export type { User, AuthResponse, AuthError } from "./types";