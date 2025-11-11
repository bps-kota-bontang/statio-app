import { API_BASE_URL } from "@/config/api";
import type { LoginRequest, LoginResponse, LoginSsoRequest } from "@/type/auth";
import type { ApiResponse } from "@/type/response";

export const login = async (
  payload: LoginRequest
): Promise<ApiResponse<LoginResponse>> => {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message);
  }

  return data;
};

export const loginSso = async (
  payload: LoginSsoRequest
): Promise<ApiResponse<LoginResponse>> => {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/sso`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message);
  }

  return data;
};
