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
import type { Chofer, TurnoAsignado } from "../../services/turnos/types";

type SupervisorDataState = {
  choferes: Chofer[];
  turnos: TurnoAsignado[];
  loading: boolean;
  loadingChoferes: boolean;
  loadingTurnos: boolean;
  error?: string;
  token?: string;
  isSupervisor: boolean;
};

type SupervisorDataContextValue = SupervisorDataState & {
  refresh: () => Promise<void>;
  refreshChoferes: () => Promise<void>;
  refreshTurnos: () => Promise<void>;
};

const SupervisorDataContext = createContext<
  SupervisorDataContextValue | undefined
>(undefined);

const extractToken = (session: any): string | undefined => {
  if (!session) return undefined;
  if (typeof session === "string") return session;
  if (Array.isArray(session)) {
    for (const item of session) {
      if (item && typeof item === "object" && item.token) {
        return item.token;
      }
    }
  }
  return session.token ?? session.accessToken ?? session.jwt ?? session.User?.token;
};

const extractUser = (session: any) => {
  if (!session) return null;
  if (Array.isArray(session)) {
    return session[1]?.user ?? session[0]?.user ?? null;
  }
  return session.User ?? session.user ?? session;
};

export const SupervisorDataProvider = ({ children }: { children: ReactNode }) => {
  const ctx = authenticated();
  const session = (ctx as any)?.user;
  const [choferes, setChoferes] = useState<Chofer[]>([]);
  const [turnos, setTurnos] = useState<TurnoAsignado[]>([]);
  const [loadingChoferes, setLoadingChoferes] = useState(true);
  const [loadingTurnos, setLoadingTurnos] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);

  const token = extractToken(session);
  const user = extractUser(session);
  const role = user?.role ?? user?.rol_id;
  const isSupervisor = role === 1 || role === "supervisor";

  const fetchChoferes = useCallback(async () => {
    if (!isSupervisor || !token) {
      setChoferes([]);
      setLoadingChoferes(false);
      if (isSupervisor && !token) {
        setError("No se encontró el token de autenticación.");
      }
      return;
    }
    setLoadingChoferes(true);
    const result = await supervisorService.getChoferes(token);
    if (result.success) {
      setChoferes(result.data);
    } else {
      setError(result.error);
    }
    setLoadingChoferes(false);
  }, [isSupervisor, token]);

  const fetchTurnos = useCallback(async () => {
    if (!isSupervisor || !token) {
      setTurnos([]);
      setLoadingTurnos(false);
      if (isSupervisor && !token) {
        setError("No se encontró el token de autenticación.");
      }
      return;
    }
    setLoadingTurnos(true);
    const result = await supervisorService.getTurnos(token);
    if (result.success) {
      setTurnos(result.data);
    } else {
      setError(result.error);
    }
    setLoadingTurnos(false);
  }, [isSupervisor, token]);

  const refresh = useCallback(async () => {
    setError(undefined);
    await Promise.all([fetchChoferes(), fetchTurnos()]);
  }, [fetchChoferes, fetchTurnos]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({
      choferes,
      turnos,
      loading: loadingChoferes || loadingTurnos,
      loadingChoferes,
      loadingTurnos,
      error: !isSupervisor
        ? "No autorizado para ver datos de supervisor."
        : error,
      token,
      isSupervisor,
      refresh,
      refreshChoferes: fetchChoferes,
      refreshTurnos: fetchTurnos,
    }),
    [
      choferes,
      turnos,
      loadingChoferes,
      loadingTurnos,
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
    throw new Error(
      "useSupervisorData debe utilizarse dentro de SupervisorDataProvider"
    );
  }
  return ctx;
};
