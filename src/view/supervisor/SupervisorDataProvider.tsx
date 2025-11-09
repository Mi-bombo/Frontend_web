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
} from "../../services/turnos/types";

type SupervisorDataState = {
  choferes: Chofer[];
  turnos: TurnoAsignado[];
  loading: boolean;
  error?: string;
};

type SupervisorDataContextValue = SupervisorDataState & {
  refresh: () => Promise<void>;
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
  return (
    session.token ??
    session.accessToken ??
    session.jwt ??
    session.User?.token
  );
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
  const [state, setState] = useState<SupervisorDataState>({
    choferes: [],
    turnos: [],
    loading: true,
  });

  const token = extractToken(session);
  const user = extractUser(session);
  const isSupervisor =
    (user?.role ?? user?.rol_id) === 1 || user?.role === "supervisor";

  const fetchData = useCallback(async () => {
    if (!isSupervisor) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "No autorizado para ver datos de supervisor.",
      }));
      return;
    }

    if (!token) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "No se encontró el token de autenticación.",
      }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: undefined }));

    const [choferRes, turnosRes] = await Promise.all([
      supervisorService.getChoferes(token),
      supervisorService.getTurnos(token),
    ]);

    setState({
      choferes: choferRes.success ? choferRes.data : [],
      turnos: turnosRes.success ? turnosRes.data : [],
      loading: false,
      error: choferRes.success
        ? turnosRes.success
          ? undefined
          : turnosRes.error
        : choferRes.error,
    });
  }, [isSupervisor, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const value = useMemo(
    () => ({
      ...state,
      refresh: fetchData,
    }),
    [state, fetchData]
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
