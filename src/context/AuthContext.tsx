import React, { createContext, useContext, useState, useCallback } from "react";
import { api, setToken, clearToken, getToken } from "@/lib/api";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  is_admin: boolean;
  isEmailVerified: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; needsVerification?: boolean }>;
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
}

const toAuthUser = (u: ApiUser): AuthUser => ({
  id: u.id,
  name: u.name,
  email: u.email,
  avatar: u.avatar,
  is_admin: u.role === "admin",
  isEmailVerified: u.isEmailVerified ?? true,
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

  const login = useCallback(async (
    email: string,
    password: string,
  ): Promise<{ success: boolean; needsVerification?: boolean }> => {
    try {
      const data = await api.post<{ token: string; user: ApiUser; needsVerification?: boolean }>(
        "/auth/login",
        { email, password },
      );
      setToken(data.token);
      const authUser = toAuthUser(data.user);
      setUser(authUser);
      persist(authUser);
      return { success: true, needsVerification: data.needsVerification ?? false };
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

  // Called after avatar upload to refresh the displayed avatar
  const updateAvatar = useCallback((url: string) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, avatar: url };
      persist(updated);
      return updated;
    });
  }, []);

  // Called after profile update (name / email)
  const updateUser = useCallback((updates: Partial<Pick<AuthUser, "name" | "email">>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      persist(updated);
      return updated;
    });
  }, []);

  // Restore session from token on first load (validates token with server)
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
          // Token invalid/expired — clear it
          clearToken();
          persist(null);
        });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoggedIn: !!user, login, signup, logout, updateAvatar, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};
