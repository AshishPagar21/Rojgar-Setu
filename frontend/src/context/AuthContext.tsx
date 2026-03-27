import { createContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { authStorage } from "../modules/auth/auth.storage";
import type { AuthProfile, User } from "../types/common.types";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  profile: AuthProfile | null;
  isAuthenticated: boolean;
  login: (payload: { token: string; user: User; profile: AuthProfile }) => void;
  setAuthData: (payload: {
    token: string;
    user: User;
    profile: AuthProfile;
  }) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(authStorage.getToken());
  const [user, setUser] = useState<User | null>(authStorage.getUser());
  const [profile, setProfile] = useState<AuthProfile | null>(
    authStorage.getProfile(),
  );

  const setAuthData = (payload: {
    token: string;
    user: User;
    profile: AuthProfile;
  }) => {
    authStorage.setAuth(payload.token, payload.user, payload.profile);
    setToken(payload.token);
    setUser(payload.user);
    setProfile(payload.profile);
  };

  const logout = () => {
    authStorage.clearAuth();
    setToken(null);
    setUser(null);
    setProfile(null);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      profile,
      isAuthenticated: Boolean(token && user),
      login: setAuthData,
      setAuthData,
      logout,
    }),
    [profile, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
