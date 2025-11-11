import { apiRequest } from "./apiClient";
import { turnosApiConfig } from "./config";
import type {
  LoginPayload,
  RegisterPayload,
  SessionResponse,
} from "./types";

const { authBaseUrl } = turnosApiConfig;

export const turnosAuthService = {
  register: (payload: RegisterPayload) =>
    apiRequest<{ message?: string }>(`${authBaseUrl}/register`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  login: (payload: LoginPayload) =>
    apiRequest<{ token?: string }>(`${authBaseUrl}/login`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  session: () =>
    apiRequest<SessionResponse>(`${authBaseUrl}/session`, {
      method: "GET",
    }),

  logout: () =>
    apiRequest<{ message?: string }>(`${authBaseUrl}/logout`, {
      method: "DELETE",
    }),

  openStream: (token: string) =>
    new EventSource(`${authBaseUrl}/stream?token=${token}`, {
      withCredentials: true,
    }),
};

export type TurnosAuthService = typeof turnosAuthService;
