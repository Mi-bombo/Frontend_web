import { apiRequest } from "./apiClient";
import { turnosApiConfig, withAuth } from "./config";
import type {
  AssignTurnoPayload,
  Chofer,
  CreateChoferPayload,
  TurnoAsignado,
  UpdateChoferPayload,
  UpdateTurnoPayload,
} from "./types";

const { supervisorBaseUrl } = turnosApiConfig;

export const supervisorService = {
  getTurnos: (token?: string) =>
    apiRequest<TurnoAsignado[]>(`${supervisorBaseUrl}/turnos-asignados`, {
      method: "GET",
      headers: {
        ...withAuth(token),
      },
    }),

  deleteTurno: (id: number, token?: string) =>
    apiRequest<{ message?: string }>(
      `${supervisorBaseUrl}/eliminar-turno/${id}`,
      {
        method: "DELETE",
        headers: {
          ...withAuth(token),
        },
        body: JSON.stringify({ id }),
      }
    ),

  updateTurno: (id: number, payload: UpdateTurnoPayload, token?: string) =>
    apiRequest<{ message?: string }>(
      `${supervisorBaseUrl}/actualizar-turno/${id}`,
      {
        method: "PUT",
        headers: {
          ...withAuth(token),
        },
        body: JSON.stringify(payload),
      }
    ),

  getChoferes: (token?: string) =>
    apiRequest<Chofer[]>(`${supervisorBaseUrl}/choferes`, {
      method: "GET",
      headers: {
        ...withAuth(token),
      },
    }),

  createChofer: (payload: CreateChoferPayload, token?: string) =>
    apiRequest<{ message?: string }>(`${supervisorBaseUrl}/crear-chofer`, {
      method: "POST",
      headers: {
        ...withAuth(token),
      },
      body: JSON.stringify({
        ...payload,
        rol_id: 2,
      }),
    }),

  updateChofer: (id: number, payload: UpdateChoferPayload, token?: string) =>
    apiRequest<{ message?: string }>(
      `${supervisorBaseUrl}/actualizar-chofer/${id}`,
      {
        method: "PUT",
        headers: {
          ...withAuth(token),
        },
        body: JSON.stringify(payload),
      }
    ),

  deleteChofer: (id: number, token?: string) =>
    apiRequest<{ message?: string }>(
      `${supervisorBaseUrl}/eliminar-chofer/${id}`,
      {
        method: "DELETE",
        headers: {
          ...withAuth(token),
        },
      }
    ),

  assignTurno: (idUsuario: number, payload: AssignTurnoPayload, token?: string) =>
    apiRequest<{ message?: string }>(
      `${supervisorBaseUrl}/asignar-turno/${idUsuario}`,
      {
        method: "POST",
        headers: {
          ...withAuth(token),
        },
        body: JSON.stringify({
          id_user: idUsuario,
          ...payload,
        }),
      }
    ),
};

export type SupervisorService = typeof supervisorService;
