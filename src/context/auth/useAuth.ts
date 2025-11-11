import { useContext } from "react";
import { AuthContext } from "@/context/auth/AuthContext";

export interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  logout: () => Promise<void>;
  refreshToken: () => Promise<string | null>;
}

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
