import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { trpc } from "./trpc";
import type { User } from "../drizzle/schema";

export type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isSignedIn: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const meQuery = trpc.auth.me.useQuery();
  const logoutMutation = trpc.auth.logout.useMutation();

  // Check if user is already logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const token = await SecureStore.getItemAsync("authToken");
        
        if (token) {
          // User has a token, fetch their profile
          if (meQuery.data) {
            setUser(meQuery.data);
          }
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        setError("Failed to check authentication");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Update user when meQuery data changes
  useEffect(() => {
    if (meQuery.data) {
      setUser(meQuery.data);
    }
  }, [meQuery.data]);

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      setIsLoading(true);

      // Call backend login endpoint (you'll need to add this to routers.ts)
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const data = await response.json();
      
      // Store token securely
      if (data.token) {
        await SecureStore.setItemAsync("authToken", data.token);
      }

      // Refresh user data
      await meQuery.refetch();
      setIsLoading(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign in failed";
      setError(message);
      setIsLoading(false);
      throw err;
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setError(null);
      setIsLoading(true);

      // Call backend signup endpoint (you'll need to add this to routers.ts)
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      if (!response.ok) {
        throw new Error("Sign up failed");
      }

      const data = await response.json();
      
      // Store token securely
      if (data.token) {
        await SecureStore.setItemAsync("authToken", data.token);
      }

      // Refresh user data
      await meQuery.refetch();
      setIsLoading(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign up failed";
      setError(message);
      setIsLoading(false);
      throw err;
    }
  };

  const signInWithGoogle = async () => {
    try {
      setError(null);
      setIsLoading(true);

      // This will be handled by the OAuth callback
      // The SDK will handle the OAuth flow and set the session cookie
      await meQuery.refetch();
      setIsLoading(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Google sign in failed";
      setError(message);
      setIsLoading(false);
      throw err;
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      setIsLoading(true);

      // Call logout mutation
      await logoutMutation.mutateAsync();

      // Clear stored token
      await SecureStore.deleteItemAsync("authToken");
      
      // Clear user state
      setUser(null);
      setIsLoading(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign out failed";
      setError(message);
      setIsLoading(false);
      throw err;
    }
  };

  const clearError = () => setError(null);

  const value: AuthContextType = {
    user,
    isLoading,
    isSignedIn: !!user,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    error,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
