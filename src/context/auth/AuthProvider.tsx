import { useState, useEffect, type ReactNode, useCallback } from "react";
import { AuthContext } from "@/context/auth/AuthContext";
import type { AuthContextType } from "@/context/auth/useAuth";
import { API_BASE_URL } from "@/config/api";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      setToken(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }, [token]);

  const refreshToken = useCallback(async (): Promise<string | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: { "x-refresh-attempt": "true" },
      });

      if (!response.ok) return null;

      const result = await response.json();
      setToken(result.data.access_token);
      return result.data.access_token;
    } catch (err) {
      console.error("Refresh token failed", err);
      setToken(null);
      return null;
    }
  }, []);

  // On mount, initialize token
  useEffect(() => {
    (async () => {
      await refreshToken();
      setLoading(false);
    })();
  }, [refreshToken]);

  if (loading) return <div>Loading...</div>;

  const value: AuthContextType & {
    refreshToken: () => Promise<string | null>;
  } = {
    token,
    setToken,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
