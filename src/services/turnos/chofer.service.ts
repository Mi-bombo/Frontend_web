import { apiRequest } from "./apiClient";
import { turnosApiConfig, withAuth } from "./config";
import type { TurnoChofer } from "./types";

const { choferBaseUrl } = turnosApiConfig;

export const choferService = {
  getMisTurnos: (token?: string) =>
    apiRequest<TurnoChofer[]>(`${choferBaseUrl}/mis-turnos`, {
      method: "GET",
      headers: {
        ...withAuth(token),
      },
    }),
};

export type ChoferService = typeof choferService;
