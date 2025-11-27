import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { AuthContext } from "@/context/auth/AuthContext";
import type { AuthContextType } from "@/hooks/useAuth";
import { API_BASE_URL } from "@/config/api";
import Loading from "@/component/ui/Loading";
import type { User } from "@/type/user";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔹 ref untuk mencegah fetchUser ganda
  const hasFetchedUser = useRef(false);

  const logout = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      setToken(null);
      setUser(null);
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

  const fetchUser = useCallback(async (accessToken: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
        credentials: "include",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch user");

      const result = await res.json();
      setUser(result.data);
    } catch (err) {
      console.error("Fetch user failed:", err);
      setUser(null);
    }
  }, []);

  // 🔹 Efek pertama: hanya untuk refresh token di awal
  useEffect(() => {
    (async () => {
      const newToken = await refreshToken();
      if (newToken) {
        hasFetchedUser.current = true;
        await fetchUser(newToken);
      }
      setLoading(false);
    })();
  }, [refreshToken, fetchUser]);

  // 🔹 Efek kedua: untuk kasus token berubah karena login manual / SSO
  useEffect(() => {
    if (token && !hasFetchedUser.current) {
      fetchUser(token);
    }
  }, [token, fetchUser]);

  if (loading) return <Loading />;

  const value: AuthContextType & {
    refreshToken: () => Promise<string | null>;
  } = {
    token,
    user,
    setToken,
    setUser,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
