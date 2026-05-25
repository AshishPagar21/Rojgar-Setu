import React, { createContext, useState, useEffect, ReactNode } from "react";
import { apiClient } from "../services/apiClient";
import { authStorage } from "../modules/auth/auth.storage";
import type { AuthProfile, User } from "../types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  profile: AuthProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isSignedIn: boolean;
  setAuthData: (payload: {
    token: string;
    user: User;
    profile: AuthProfile;
  }) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  console.log("AuthProvider initializing...");

  const setAuthData = async (payload: {
    token: string;
    user: User;
    profile: AuthProfile;
  }) => {
    try {
      console.log("Setting auth data...");
      await authStorage.setAuth(payload.token, payload.user, payload.profile);
      apiClient.setAuthToken(payload.token);
      setToken(payload.token);
      setUser(payload.user);
      setProfile(payload.profile);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Error setting auth data:", error);
      throw error;
    }
  };

  const restoreSession = async () => {
    try {
      console.log("Restoring session...");
      setIsLoading(true);
      const [storedToken, storedUser, storedProfile] = await Promise.all([
        authStorage.getToken(),
        authStorage.getUser(),
        authStorage.getProfile(),
      ]);

      console.log("Stored data:", {
        storedToken: !!storedToken,
        storedUser: !!storedUser,
        storedProfile: !!storedProfile,
      });

      if (storedToken && storedUser && storedProfile) {
        apiClient.setAuthToken(storedToken);
        setToken(storedToken);
        setUser(storedUser);
        setProfile(storedProfile);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Error restoring session:", error);
      await authStorage.clearAuth();
      apiClient.clearAuthToken();
      setToken(null);
      setUser(null);
      setProfile(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
      console.log("Session restore complete, isLoading:", false);
    }
  };

  // Logout
  const logout = async () => {
    try {
    } finally {
      await authStorage.clearAuth();
      apiClient.clearAuthToken();
      setToken(null);
      setUser(null);
      setProfile(null);
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    void restoreSession();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        profile,
        isLoading,
        isAuthenticated,
        isSignedIn: isAuthenticated,
        setAuthData,
        logout,
        restoreSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
