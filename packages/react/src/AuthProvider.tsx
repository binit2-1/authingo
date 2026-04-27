"use client"

import React, { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { request } from "./fetcher";
import type { User } from "./types";

/**
 * The global authentication state provided by AuthInGo.
 */
interface AuthState {
  /** The currently authenticated user, or null if unauthenticated. */
  user: User | null;
  /** Indicates if the SDK is currently fetching or verifying the session state. */
  isLoading: boolean;
  /** Contains any error message related to the authentication state. */
  error: string | null;
  /** Manually triggers a silent re-fetch of the session from the Go backend. */
  checkSession: () => Promise<void>;
  /** Terminates the current session in the database and clears the user state. */
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export interface AuthProviderProps {
  children: ReactNode;
  /**
   * The base URL pointing to your Go AuthInGo backend routes.
   * @example "http://localhost:8080/api/auth"
   */
  baseURL?: string;
}

/**
 * Wraps your Next.js or React application to provide global authentication state.
 * Automatically handles session fetching, background checks, and silent token refreshes.
 */
export function AuthProvider({ children, baseURL = "" }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkSession = async () => {
    setIsLoading(true);
    // Fixed: Changed from "/api/auth/session" to "/session" to respect the baseURL
    const { data, error } = await request<{ user: User }>("/session", { baseURL });
    
    if (error) {
      setUser(null);
      setError(error.message);
    } else if (data?.user) {
      setUser(data.user);
      setError(null);
    }
    setIsLoading(false);
  };

  const logout = async () => {
    // Fixed: Changed from "/api/auth/sign-out" to "/sign-out"
    await request("/sign-out", { method: "POST", baseURL });
    setUser(null);
  };

  useEffect(() => {
    checkSession();

    const handleFatalLogout = () => {
      setUser(null);
      setError("Session permanently expired. Please log in again.");
    };

    window.addEventListener("authingo:logout", handleFatalLogout);

    return () => {
      window.removeEventListener("authingo:logout", handleFatalLogout);
    };
  }, [baseURL]);

  return (
    <AuthContext.Provider value={{ user, isLoading, error, checkSession, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * A React hook to access the current authentication state, user data, and session methods.
 * Must be used inside an `<AuthProvider>`.
 * * @returns {AuthState} The current authentication context.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}