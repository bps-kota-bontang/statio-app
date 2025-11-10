import { useAuth } from "@/context/auth/useAuth";
import { useCallback } from "react";

export const useApiFetch = () => {
  const { token, logout, refreshToken } = useAuth();

  const apiFetch = useCallback(
    async <T>(url: string, options: RequestInit = {}): Promise<T> => {
      const request = async (accessToken?: string) => {
        const res = await fetch(url, {
          method: options.method || "GET",
          headers: {
            "Content-Type": "application/json",
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
            ...(options.headers || {}),
          },
          credentials: "include",
          ...options,
        });

        if (
          res.status === 401 &&
          !(options.headers as Record<string, string>)?.["x-refresh-attempt"]
        ) {
          const newToken = await refreshToken();
          if (newToken) return request(newToken);
          logout();
          throw new Error("Unauthorized");
        }

        const data = await res.json().catch(() => null);
        if (!res.ok) throw new Error(data?.message || "Something went wrong");
        return data;
      };

      return request(token ?? undefined);
    },
    [token, refreshToken, logout]
  );

  return apiFetch;
};
