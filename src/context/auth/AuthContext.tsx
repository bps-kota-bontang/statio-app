import { createContext } from "react";
import type { AuthContextType } from "@/context/auth/useAuth";

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
