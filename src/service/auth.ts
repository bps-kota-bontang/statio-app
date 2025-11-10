import { API_BASE_URL } from "@/config/api";
import type { LoginRequest, LoginResponse } from "@/type/auth";
import type { ApiResponse } from "@/type/response";

export const login = async (
  payload: LoginRequest
): Promise<ApiResponse<LoginResponse>> => {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include", // supaya HttpOnly cookie diterima
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message);
  }

  return data;
};
