import { apiRequest } from "./apiClient";
import { turnosApiConfig, withAuth } from "./config";
import type { TurnoChofer } from "./types";

const { choferBaseUrl } = turnosApiConfig;

async function firstOk<T>(urls: string[], init: RequestInit) {
  for (const url of urls) {
    const res = await apiRequest<T>(url, init);
    if (res.success) return res;
  }
  return { success: false, error: `404 en: ${urls.join(", ")}` } as const;
}

export const choferService = {
  getMisTurnos: (token?: string) =>
    firstOk<TurnoChofer[]>(
      [
        `${choferBaseUrl}/mis-turnos`,
        `${choferBaseUrl}/turnos`,
      ],
      {
        method: "GET",
        headers: { ...withAuth(token) },
      }
    ),
};

export type ChoferService = typeof choferService;
