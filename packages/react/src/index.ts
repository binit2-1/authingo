import { useState, useEffect } from "react";
import { request } from "./fetcher";
import { type AuthResponse } from "./types";

export interface AuthClientOptions {
    /** * The absolute URL pointing to your Go AuthInGo backend routes.
     * @example "http://localhost:8080/api/auth"
     */
    baseURL: string;
}

/**
 * Initializes the AuthInGo React SDK.
 * * This creates a localized instance of the auth client wired to your Go backend,
 * providing fully typed server actions and React hooks.
 * * @param options - Configuration including your backend baseURL.
 */
export function createAuthClient(options: AuthClientOptions){
    const {baseURL} = options;

    return {
        /** Core authentication actions for logging in and registering users. */
        signIn:{
            /**
             * Authenticates an existing user via email and password.
             * On success, the Go backend automatically securely sets an HttpOnly session cookie.
             * * @param credentials - An object containing `email` and `password`.
             */
            email: async (credentials: { email: string; password: string }) => {
                return request<AuthResponse>("/sign-in",{
                    baseURL,
                    method: "POST",
                    body: JSON.stringify(credentials)
                })
            }
        },

        signUp:{
            /**
             * Registers a new user and immediately establishes a login session.
             * * @param credentials - An object containing `email`, `password`, and `name`.
             */
            email: async (credentials: { email: string; password: string; name: string }) => {
                return request<AuthResponse>("/sign-up",{
                    baseURL,
                    method: "POST",
                    body: JSON.stringify(credentials)
                })
            }
        },

        /**
         * Terminates the current active session in the database and 
         * instructs the browser to clear the session cookie.
         */
        signOut: async () =>{
            return request("/sign-out",{
                baseURL,
                method: "POST",
            })
        },

        /**
         * A React hook that automatically fetches and manages the current user's session state.
         * * @returns An object containing the authentication `data`, a loading boolean `isPending`, and any `error`.
         */
        useSession: () => {
            const [data, setData] = useState<AuthResponse | null>(null);
            const [isPending, setIsPending] = useState(true);
            const [error, setError] = useState<string | null>(null);


            useEffect(() => {
                const fetchSession = async () =>{
                    const res = await request<AuthResponse>("/session", {
                        baseURL,
                        method: "GET",
                    })
                    if (res.error){
                        setError(String(res.error.message));
                        setData(null);
                    } else {
                        setData(res.data);
                        setError(null);
                    }
                    setIsPending(false);
                };

                fetchSession();
            }, [baseURL]);

            return {data, isPending, error};
        }
    }
}