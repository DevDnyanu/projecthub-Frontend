import React, { createContext, useContext, useState, useCallback } from "react";
import { api, setToken, clearToken, getToken } from "@/lib/api";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  is_admin: boolean;
  isEmailVerified: boolean;
  twoFactorEnabled?: boolean;
}

export type LoginResult =
  | { success: true;  requires2FA: false; needsVerification?: boolean }
  | { success: true;  requires2FA: true;  tempToken: string }
  | { success: false; requires2FA?: never };

interface AuthContextType {
  user: AuthUser | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  complete2faLogin: (tempToken: string, totpCode: string) => Promise<LoginResult>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateAvatar: (url: string) => void;
  updateUser: (updates: Partial<Pick<AuthUser, "name" | "email">>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

const SESSION_KEY = "ph_session";

interface ApiUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: "buyer" | "seller" | "admin";
  isEmailVerified?: boolean;
  twoFactorEnabled?: boolean;
}

const toAuthUser = (u: ApiUser): AuthUser => ({
  id: u.id,
  name: u.name,
  email: u.email,
  avatar: u.avatar,
  is_admin: u.role === "admin",
  isEmailVerified: u.isEmailVerified ?? true,
  twoFactorEnabled: u.twoFactorEnabled ?? false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  });

  const persist = (u: AuthUser | null) => {
    if (u) localStorage.setItem(SESSION_KEY, JSON.stringify(u));
    else localStorage.removeItem(SESSION_KEY);
  };

  // Step 1: email + password
  const login = useCallback(async (email: string, password: string): Promise<LoginResult> => {
    try {
      const data = await api.post<{
        token?: string;
        user?: ApiUser;
        needsVerification?: boolean;
        requires2FA?: boolean;
        tempToken?: string;
      }>("/auth/login", { email, password });

      // 2FA required — server didn't issue a full JWT yet
      if (data.requires2FA && data.tempToken) {
        return { success: true, requires2FA: true, tempToken: data.tempToken };
      }

      // Normal login — JWT returned
      if (data.token && data.user) {
        setToken(data.token);
        const authUser = toAuthUser(data.user);
        setUser(authUser);
        persist(authUser);
        return { success: true, requires2FA: false, needsVerification: data.needsVerification ?? false };
      }

      return { success: false };
    } catch {
      return { success: false };
    }
  }, []);

  // Step 2: verify TOTP code after 2FA challenge
  const complete2faLogin = useCallback(async (tempToken: string, totpCode: string): Promise<LoginResult> => {
    try {
      const data = await api.post<{ token: string; user: ApiUser; needsVerification?: boolean }>(
        "/auth/verify-2fa-login",
        { tempToken, totpCode }
      );
      setToken(data.token);
      const authUser = toAuthUser(data.user);
      setUser(authUser);
      persist(authUser);
      return { success: true, requires2FA: false, needsVerification: data.needsVerification ?? false };
    } catch {
      return { success: false };
    }
  }, []);

  const signup = useCallback(
    async (name: string, email: string, password: string): Promise<boolean> => {
      try {
        await api.post("/auth/register", { name, email, password });
        return true;
      } catch {
        return false;
      }
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    persist(null);
    clearToken();
    localStorage.removeItem("adminAuth");
    localStorage.removeItem("userAuth");
  }, []);

  const updateAvatar = useCallback((url: string) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, avatar: url };
      persist(updated);
      return updated;
    });
  }, []);

  const updateUser = useCallback((updates: Partial<Pick<AuthUser, "name" | "email">>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      persist(updated);
      return updated;
    });
  }, []);

  // Restore session from token on first load
  React.useEffect(() => {
    const token = getToken();
    if (token && !user) {
      api
        .get<ApiUser>("/auth/me")
        .then((u) => {
          const authUser = toAuthUser(u);
          setUser(authUser);
          persist(authUser);
        })
        .catch(() => {
          clearToken();
          persist(null);
        });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoggedIn: !!user, login, complete2faLogin, signup, logout, updateAvatar, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};
