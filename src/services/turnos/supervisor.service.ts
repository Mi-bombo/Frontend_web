    import type {
  AssignTurnoPayload,
  CreateChoferPayload,
  UpdateChoferPayload,
  TurnoAsignado,
  Chofer,
  TurnoCatalogo,
} from "./types";

const API = (import.meta as any)?.env?.VITE_SUPERVISOR_API ?? "http://127.0.0.1:2000";

type ServiceResult<T = unknown> =
  Promise<{ success: true; data: T } | { success: false; error: string; raw?: unknown }>;

const headers = (token?: string) => ({
  "Content-Type": "application/json",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

const jsonOrText = async (res: Response) => {
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  return res.text();
};

const fail = async (res: Response, fallback: string) => {
  const body = await jsonOrText(res);
  const msg =
    (typeof body === "string" ? body : body?.message || body?.error) ||
    `${fallback} (HTTP ${res.status})`;
  return { success: false as const, error: String(msg), raw: body };
};

const ok = async <T>(res: Response) => {
  const data = (await jsonOrText(res)) as T;
  return { success: true as const, data };
};

const pick = <T extends object, K extends keyof T>(obj: T, keys: K[]) =>
  keys.reduce((acc, k) => (obj[k] !== undefined ? { ...acc, [k]: obj[k] } : acc), {} as Pick<T, K>);

const isISODate = (s: unknown): s is string => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);

export const supervisorService = {
  async getTurnos(token?: string): ServiceResult<TurnoAsignado[]> {
    const res = await fetch(`${API}/supervisor/turnos-asignados`, {
      method: "GET",
      headers: headers(token),
    });
    if (!res.ok) return fail(res, "No se pudieron obtener los turnos asignados");
    return ok<TurnoAsignado[]>(res);
  },

  async getCatalogoTurnos(token?: string): ServiceResult<TurnoCatalogo[]> {
    const res = await fetch(`${API}/supervisor/catalogo-turnos`, {
      method: "GET",
      headers: headers(token),
    });
    if (!res.ok) return fail(res, "No se pudo obtener el catálogo de turnos");
    return ok<TurnoCatalogo[]>(res);
  },

  async getChoferes(token?: string): ServiceResult<Chofer[]> {
    const res = await fetch(`${API}/supervisor/choferes`, {
      method: "GET",
      headers: headers(token),
    });
    if (!res.ok) return fail(res, "No se pudieron obtener los choferes");
    return ok<Chofer[]>(res);
  },

  async assignTurno(
    idUsuario: number,
    payload: AssignTurnoPayload,
    token?: string
  ): ServiceResult<{ id: number }> {
    if (!payload?.id_turno) return { success: false, error: "Falta id_turno" };
    if (!isISODate(payload?.fecha)) return { success: false, error: "Falta fecha válida (AAAA-MM-DD)" };

    const body = JSON.stringify(pick(payload, ["id_turno", "fecha"]));
    const res = await fetch(`${API}/supervisor/asignar-turno/${idUsuario}`, {
      method: "POST",
      headers: headers(token),
      body,
    });
    if (!res.ok) return fail(res, "No se pudo asignar el turno");
    return ok<{ id: number }>(res);
  },

  async updateTurno(
    turnoAsignadoId: number,
    payload: { id_turno: number; fecha: string },
    token?: string
  ): ServiceResult<{ id: number }> {
    if (!payload?.id_turno) return { success: false, error: "Falta id_turno" };
    if (!isISODate(payload?.fecha)) return { success: false, error: "Falta fecha válida (AAAA-MM-DD)" };

    const body = JSON.stringify(pick(payload, ["id_turno", "fecha"]));
    const res = await fetch(`${API}/supervisor/actualizar-turno/${turnoAsignadoId}`, {
      method: "PUT",
      headers: headers(token),
      body,
    });
    if (!res.ok) return fail(res, "No se pudo actualizar el turno");
    return ok<{ id: number }>(res);
  },

  async deleteTurno(turnoAsignadoId: number, token?: string): ServiceResult<void> {
    const res = await fetch(`${API}/supervisor/eliminar-turno/${turnoAsignadoId}`, {
      method: "DELETE",
      headers: headers(token),
    });
    if (!res.ok) return fail(res, "No se pudo eliminar el turno");
    return { success: true, data: undefined as void };
  },

  // --- Choferes (endpoints corregidos) ---
  async createChofer(payload: CreateChoferPayload, token?: string): ServiceResult<Chofer> {
    const body = JSON.stringify(pick(payload, ["nombre", "email", "password"]));
    const res = await fetch(`${API}/supervisor/crear-chofer`, {
      method: "POST",
      headers: headers(token),
      body,
    });
    if (!res.ok) return fail(res, "No se pudo crear el chofer");
    return ok<Chofer>(res);
  },

  async updateChofer(id: number, payload: UpdateChoferPayload, token?: string): ServiceResult<Chofer> {
    const body = JSON.stringify(pick(payload, ["nombre", "email", "password"]));
    const res = await fetch(`${API}/supervisor/actualizar-chofer/${id}`, {
      method: "PUT",
      headers: headers(token),
      body,
    });
    if (!res.ok) return fail(res, "No se pudo actualizar el chofer");
    return ok<Chofer>(res);
  },

  async deleteChofer(id: number, token?: string): ServiceResult<void> {
    const res = await fetch(`${API}/supervisor/eliminar-chofer/${id}`, {
      credentials: "include",
      method: "DELETE",
      headers: headers(token),
    });
    if (!res.ok) return fail(res, "No se pudo eliminar el chofer");
    return { success: true, data: undefined as void };
  },
  
  // Asignar una o varias líneas a un chofer
  async assignLineas(idUsuario: number, payload: { lineas: number[] }, token?: string): ServiceResult<void> {
    if (!Array.isArray(payload?.lineas)) return { success: false, error: "Payload inválido: se espera un arreglo 'lineas'" };
    // Nueva API: el microservicio expone un recurso `chofer-lineas` que crea una asignación por POST
    // Hacemos un POST por cada línea para que el backend emita el evento `chofer-linea-asignada` por cada asignación.
    for (const lineaId of payload.lineas) {
      const body = JSON.stringify({ chofer_id: idUsuario, linea_id: lineaId });
      const res = await fetch(`${API.replace(/\/supervisor|:\d+$/,'')}/chofer-lineas`, {
        method: "POST",
        headers: headers(token),
        body,
      });
      if (!res.ok) return fail(res, "No se pudieron asignar las líneas");
    }
    return { success: true, data: undefined as void };
  },
  
  async getLineasByChofer(idUsuario: number, token?: string): ServiceResult<Array<{ id: number; nombre: string }>> {
    // Nueva API: consultar asignaciones filtrando por choferId
    const url = new URL(`${API.replace(/\/supervisor|:\d+$/,'')}/chofer-lineas`);
    url.searchParams.set('choferId', String(idUsuario));
    const res = await fetch(url.toString(), {
      method: "GET",
      headers: headers(token),
    });
    if (!res.ok) return fail(res, "No se pudieron obtener las líneas asignadas");
    const data = await res.json();
    // la API devuelve objetos con detalles; mapeamos a {id, nombre} por compatibilidad con la UI
    const mapped = (data || []).map((d: any) => ({ id: d.linea?.id ?? d.linea_id ?? d.id, nombre: d.linea?.nombre ?? d.linea_nombre ?? d.nombre ?? "" }));
    return { success: true as const, data: mapped };
  },
};
