export type RolId = 1 | 2;

export interface SessionUser {
  id: number;
  nombre: string;
  email: string;
  rol_id: RolId;
}

export interface SessionResponse {
  token?: string;
  User?: SessionUser;
}

export interface RegisterPayload {
  nombre: string;
  email: string;
  password: string;
  rol_id: RolId;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface Chofer {
  id: number;
  nombre: string;
  email: string;
}

export interface CreateChoferPayload {
  nombre: string;
  email: string;
  password: string;
}

export interface UpdateChoferPayload {
  nombre?: string;
  email?: string;
  password?: string;
}

export type TurnoAsignado = {
  id: number;
  id_turno: number;
  id_user: number;
  nombre_turno: string;
  nombre_chofer: string;
  dia?: string;     
  fecha?: string;   
};

export type UpdateTurnoPayload = {
  id_turno: number;
  fecha: string;
};

export type AssignTurnoPayload = {
  id_turno: number;
  fecha: string; 
};

export interface TurnoChofer {
  id?: number;
  nombre_turno: string;
  fecha?: string;
  dia?: string; 
}


export interface TurnoCatalogo {
  id: number;
  nombre: string;
}

export type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; raw?: unknown };
