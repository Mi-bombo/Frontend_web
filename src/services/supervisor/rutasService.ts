import { useState } from "react";

const BASE_URL = "http://localhost:4000/lineas";

export type ParadaCoords = { coords: [number, number] };
export type TrayectoMulti = number[][][];
export type CrearRutaRequest = {
  nombre: string;
  descripcion?: string;
  trayecto: TrayectoMulti;
  paradas: ParadaCoords[];
};
export type CrearLineaRequest = {
  nombre: string;
  descripcion?: string;
  estado?: string;
};
export type CrearLineaYRutaRequest = {
  linea: CrearLineaRequest;
  ruta: CrearRutaRequest;
};
export type RutasQueryParams = {
  q?: string;
  page?: number;
  limit?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
};
export type RutaFrontend = {
  id: number;
  nombre: string;
  descripcion?: string;
  trayecto: { type: string; coordinates: number[][][] };
  paradas: ParadaCoords[];
  fecha_creacion: string;
};

interface ServiceResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export const useRutasService = () => {
  const [rutas, setRutas] = useState<RutaFrontend[]>([]);
  const [ruta, setRuta] = useState<RutaFrontend | null>(null);
  const [loading, setLoading] = useState(false);

  const formatQuery = (params: RutasQueryParams) =>
    new URLSearchParams(
      Object.entries(params)
        .filter(([_, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)])
    ).toString();

  const crearLineaYRuta = async (
    data: CrearLineaYRutaRequest
  ): Promise<ServiceResult<{ id: number }>> => {
    setLoading(true);
    try {
      const response = await fetch(BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const res = await response.json();
      setLoading(false);
      if (response.ok) return { success: true, data: res };
      return {
        success: false,
        error: res?.error || "No se pudo crear la línea/ruta",
      };
    } catch (e) {
      setLoading(false);
      return { success: false, error: (e as any)?.message || "Error de red" };
    }
  };

  const obtenerRutas = async (params: RutasQueryParams = {}) => {
    setLoading(true);
    const q = formatQuery(params);
    try {
      const response = await fetch(`${BASE_URL}?${q}`);
      const res = await response.json();
      console.log("Respuesta fetch:", res);
      setLoading(false);
      setRutas(Array.isArray(res) ? res : []);
      if (response.ok) return { success: true, data: res };
      return { success: false, error: res?.error || "No se pudo cargar rutas" };
    } catch (e) {
      setLoading(false);
      return { success: false, error: (e as any)?.message || "Error de red" };
    }
  };

  const obtenerRutaPorId = async (
    id: number
  ): Promise<ServiceResult<RutaFrontend>> => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/${id}`);
      const res = await response.json();
      setLoading(false);
      setRuta(response.ok ? res : null);
      if (response.ok) return { success: true, data: res };
      return { success: false, error: res?.error || "No encontrada" };
    } catch (e) {
      setLoading(false);
      return { success: false, error: (e as any)?.message || "Error de red" };
    }
  };

  const editarLineaYRuta = async (
    id: number,
    data: CrearLineaYRutaRequest
  ): Promise<ServiceResult<void>> => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      setLoading(false);
      if (response.ok) return { success: true };
      const res = await response.json().catch(() => ({}));
      return {
        success: false,
        error: res?.error || "No se pudo editar línea/ruta",
      };
    } catch (e) {
      setLoading(false);
      return { success: false, error: (e as any)?.message || "Error de red" };
    }
  };

  const eliminarRuta = async (id: number): Promise<ServiceResult<void>> => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
      setLoading(false);
      if (response.ok) return { success: true };
      const res = await response.json().catch(() => ({}));
      return {
        success: false,
        error: res?.error || "No se pudo borrar la ruta",
      };
    } catch (e) {
      setLoading(false);
      return { success: false, error: (e as any)?.message || "Error de red" };
    }
  };

  return {
    rutas,
    setRutas,
    ruta,
    setRuta,
    loading,
    crearLineaYRuta,
    obtenerRutas,
    obtenerRutaPorId,
    editarLineaYRuta,
    eliminarRuta,
  };
};
