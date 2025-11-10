import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { authenticated } from "../../context/AppContext";
import { supervisorService } from "../../services/turnos/supervisor.service";
import type {
  Chofer,
  TurnoAsignado,
  TurnoCatalogo,
} from "../../services/turnos/types";

type SupervisorDataState = {
  choferes: Chofer[];
  turnos: TurnoAsignado[];
  catalogoTurnos: TurnoCatalogo[];
  loading: boolean;
  loadingChoferes: boolean;
  loadingTurnos: boolean;
  loadingCatalogo: boolean;
  error?: string;
  token?: string;
  isSupervisor: boolean;
};

type SupervisorDataContextValue = SupervisorDataState & {
  refresh: () => Promise<void>;
  refreshChoferes: () => Promise<void>;
  refreshTurnos: () => Promise<void>;
};

const SupervisorDataContext = createContext<SupervisorDataContextValue | undefined>(undefined);

const uniqueFromTurnos = (turnos: TurnoAsignado[]): TurnoCatalogo[] => {
  const m = new Map<number, string>();
  for (const t of turnos) {
    if (t.id_turno && t.nombre_turno && !m.has(t.id_turno)) {
      m.set(t.id_turno, t.nombre_turno);
    }
  }
  return Array.from(m, ([id, nombre]) => ({ id, nombre }));
};

export const SupervisorDataProvider = ({ children }: { children: ReactNode }) => {
  const ctx = authenticated();
  const session = (ctx as any)?.user;

  const [choferes, setChoferes] = useState<Chofer[]>([]);
  const [turnos, setTurnos] = useState<TurnoAsignado[]>([]);
  const [catalogoTurnos, setCatalogoTurnos] = useState<TurnoCatalogo[]>([]);
  const [loadingChoferes, setLoadingChoferes] = useState(true);
  const [loadingTurnos, setLoadingTurnos] = useState(true);
  const [loadingCatalogo, setLoadingCatalogo] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);

  const token = (session as any)?.token;
  const user = (session as any)?.user ?? (session as any)?.User ?? null;
  const role = user?.role ?? user?.rol_id;
  const isSupervisor = role === 1 || role === "supervisor";

  const fetchChoferes = useCallback(async () => {
    if (!isSupervisor) {
      setChoferes([]);
      setLoadingChoferes(false);
      return;
    }
    setLoadingChoferes(true);
    const result = await supervisorService.getChoferes(token);
    if (result.success) setChoferes(result.data);
    else setError(result.error);
    setLoadingChoferes(false);
  }, [isSupervisor, token]);

  const fetchTurnos = useCallback(async () => {
    if (!isSupervisor) {
      setTurnos([]);
      setLoadingTurnos(false);
      return;
    }
    setLoadingTurnos(true);
    const result = await supervisorService.getTurnos(token);
    if (result.success) setTurnos(result.data);
    else setError(result.error);
    setLoadingTurnos(false);
  }, [isSupervisor, token]);

  const buildCatalog = useCallback((ts: TurnoAsignado[]) => {
    const derived = uniqueFromTurnos(ts);
    setCatalogoTurnos(
      derived.length > 0
        ? derived
        : [
            { id: 1, nombre: "Mañana" },
            { id: 2, nombre: "Tarde" },
            { id: 3, nombre: "Noche" },
          ]
    );
    setLoadingCatalogo(false);
  }, []);

  const refresh = useCallback(async () => {
    setError(undefined);
    await fetchTurnos();
    await fetchChoferes();
  }, [fetchTurnos, fetchChoferes]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!loadingTurnos) {
      setLoadingCatalogo(true);
      buildCatalog(turnos);
    }
  }, [loadingTurnos, turnos, buildCatalog]);

  const value = useMemo(
    () => ({
      choferes,
      turnos,
      catalogoTurnos,
      loading: loadingChoferes || loadingTurnos || loadingCatalogo,
      loadingChoferes,
      loadingTurnos,
      loadingCatalogo,
      error: !isSupervisor ? "No autorizado para ver datos de supervisor." : error,
      token,
      isSupervisor,
      refresh,
      refreshChoferes: fetchChoferes,
      refreshTurnos: fetchTurnos,
    }),
    [
      choferes,
      turnos,
      catalogoTurnos,
      loadingChoferes,
      loadingTurnos,
      loadingCatalogo,
      error,
      token,
      isSupervisor,
      refresh,
      fetchChoferes,
      fetchTurnos,
    ]
  );

  return (
    <SupervisorDataContext.Provider value={value}>
      {children}
    </SupervisorDataContext.Provider>
  );
};

export const useSupervisorData = () => {
  const ctx = useContext(SupervisorDataContext);
  if (!ctx) {
    throw new Error("useSupervisorData debe utilizarse dentro de SupervisorDataProvider");
  }
  return ctx;
};

export const useSupervisorDataOptional = () => {
  const ctx = useContext(SupervisorDataContext);
  if (ctx) return ctx;

  return {
    choferes: [],
    turnos: [],
    catalogoTurnos: [],
    loading: false,
    loadingChoferes: false,
    loadingTurnos: false,
    loadingCatalogo: false,
    error: undefined,
    token: undefined,
    isSupervisor: false,
    refresh: async () => {},
    refreshChoferes: async () => {},
    refreshTurnos: async () => {},
  } as const;
};