"use client"

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
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
const AUTHINGO_CHANNEL = "authingo";

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
  const requestIdRef = useRef(0);
  const channelRef = useRef<BroadcastChannel | null>(null);

  const clearSessionState = (message?: string) => {
    setUser(null);
    setError(message ?? null);
    setIsLoading(false);
  };

  const checkSession = async () => {
    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    // Fixed: Changed from "/api/auth/session" to "/session" to respect the baseURL
    const { data, error } = await request<{ user: User }>("/session", { baseURL });

    if (requestId !== requestIdRef.current) return;
    
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
    clearSessionState();
    channelRef.current?.postMessage({ type: "logout" });
    window.localStorage.setItem("authingo:logout", String(Date.now()));
  };

  useEffect(() => {
    checkSession();

    const handleFatalLogout = () => {
      clearSessionState("Session permanently expired. Please log in again.");
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.key === "authingo:logout") {
        clearSessionState();
      }
    };

    if ("BroadcastChannel" in window) {
      channelRef.current = new BroadcastChannel(AUTHINGO_CHANNEL);
      channelRef.current.onmessage = (event) => {
        if (event.data?.type === "logout") {
          clearSessionState();
        }
      };
    }

    window.addEventListener("authingo:logout", handleFatalLogout);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("authingo:logout", handleFatalLogout);
      window.removeEventListener("storage", handleStorage);
      channelRef.current?.close();
      channelRef.current = null;
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
