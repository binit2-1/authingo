"use client";

import { useEffect, useRef, useState } from "react";
import { request } from "./fetcher";
import { type AuthResponse, type UseSessionResult } from "./types";

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
        useSession: (): UseSessionResult => {
            const [data, setData] = useState<AuthResponse | null>(null);
            const [isPending, setIsPending] = useState(true);
            const [error, setError] = useState<string | null>(null);
            const requestIdRef = useRef(0);

            const refetch = async () => {
                const requestId = ++requestIdRef.current;
                setIsPending(true);
                const result = await request<AuthResponse>("/session", { baseURL });

                if (requestId !== requestIdRef.current) return;

                if (result.error) {
                    setData(null);
                    setError(result.error.message);
                } else {
                    setData(result.data);
                    setError(null);
                }
                setIsPending(false);
            };

            useEffect(() => {
                refetch();

                const handleLogout = () => {
                    setData(null);
                    setError(null);
                    setIsPending(false);
                };
                const handleStorage = (event: StorageEvent) => {
                    if (event.key === "authingo:logout") {
                        handleLogout();
                    }
                };
                const channel = "BroadcastChannel" in window ? new BroadcastChannel("authingo") : null;
                if (channel) {
                    channel.onmessage = (event) => {
                        if (event.data?.type === "logout") {
                            handleLogout();
                        }
                    };
                }

                window.addEventListener("authingo:logout", handleLogout);
                window.addEventListener("storage", handleStorage);

                return () => {
                    window.removeEventListener("authingo:logout", handleLogout);
                    window.removeEventListener("storage", handleStorage);
                    channel?.close();
                };
            }, []);

            return { data, isPending, error, refetch };
        },

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
            const result = await request("/sign-out", {
                baseURL,
                method: "POST",
            });
            if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("authingo:logout"));
                window.localStorage.setItem("authingo:logout", String(Date.now()));
                if ("BroadcastChannel" in window) {
                    const channel = new BroadcastChannel("authingo");
                    channel.postMessage({ type: "logout" });
                    channel.close();
                }
            }
            return result;
        }
    }
}

// Export the Global State Provider and Hook
export { AuthProvider, useAuth } from "./AuthProvider";

// Export the types so developers can type their own variables
export type { User, AuthResponse, AuthError, Session, UseSessionResult } from "./types";
