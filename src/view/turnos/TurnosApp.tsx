import type { ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import { SupervisorPanel } from "../../components/turnos/SupervisorPanel";
import { ChoferPanel } from "../../components/turnos/ChoferPanel";
import { ResponseMessage } from "../../components/turnos/ResponseMessage";
import { UpdateTurnoModal } from "../../components/turnos/UpdateTurnoModal";
import { UpdateChoferModal } from "../../components/turnos/UpdateChoferModal";
import { AssignTurnoModal } from "../../components/turnos/AssignTurnoModal";
import { turnosAuthService } from "../../services/turnos/authPortal.service";
import { supervisorService } from "../../services/turnos/supervisor.service";
import { choferService } from "../../services/turnos/chofer.service";
import type {
  AssignTurnoPayload,
  Chofer,
  CreateChoferPayload,
  SessionResponse,
  TurnoAsignado,
  TurnoChofer,
  UpdateChoferPayload,
  UpdateTurnoPayload,
  TurnoCatalogo,
} from "../../services/turnos/types";

type OperationResult = { success: boolean; error?: string };

const initialLoadingState = {
  auth: true,
  turnos: false,
  choferes: false,
  misTurnos: false,
  catalogo: false,
};

export default function TurnosApp() {
  const [session, setSession] = useState<SessionResponse | null>(null);
  const [token, setToken] = useState<string | undefined>();
  const [message, setMessage] = useState<string | null>(null);
  const [turnos, setTurnos] = useState<TurnoAsignado[]>([]);
  const [choferes, setChoferes] = useState<Chofer[]>([]);
  const [assignedLines, setAssignedLines] = useState<Record<number, Array<{ id: number; nombre: string }>>>({});
  const [misTurnos, setMisTurnos] = useState<TurnoChofer[]>([]);
  const [catalogoTurnos, setCatalogoTurnos] = useState<TurnoCatalogo[]>([]);
  const [loading, setLoading] = useState(initialLoadingState);
  const [turnoToEdit, setTurnoToEdit] = useState<TurnoAsignado | null>(null);
  const [choferToEdit, setChoferToEdit] = useState<Chofer | null>(null);
  const [choferToAssign, setChoferToAssign] = useState<Chofer | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const setLoadingFlag = (key: keyof typeof loading, value: boolean) => {
    setLoading((prev) => ({ ...prev, [key]: value }));
  };

  const showError = (error?: string, fallback = "Ocurrió un error inesperado.") => {
    setMessage(error ?? fallback);
  };

  const isSupervisor = session?.User?.rol_id === 1;
  const isChofer = session?.User?.rol_id === 2;

  const refreshSession = useCallback(async () => {
    setLoadingFlag("auth", true);
    const response = await turnosAuthService.session();
    if (response.success) {
      setSession(response.data);
      setToken(response.data?.token);
    } else {
      setSession(null);
      setToken(undefined);
    }
    setLoadingFlag("auth", false);
  }, []);

  useEffect(() => {
    refreshSession();
    return () => eventSourceRef.current?.close();
  }, [refreshSession]);

  const fetchTurnos = useCallback(async () => {
    if (!token) return;
    setLoadingFlag("turnos", true);
    const res = await supervisorService.getTurnos(token);
    if (res.success) setTurnos(res.data);
    else showError(res.error, "No se pudieron cargar los turnos.");
    setLoadingFlag("turnos", false);
  }, [token]);

  const fetchChoferes = useCallback(async () => {
    if (!token) return;
    setLoadingFlag("choferes", true);
    const res = await supervisorService.getChoferes(token);
    if (res.success) setChoferes(res.data);
    else showError(res.error, "No se pudieron cargar los choferes.");
    setLoadingFlag("choferes", false);
  }, [token]);

  const fetchAssignedLinesForChofer = useCallback(
    async (choferId: number) => {
      if (!token) return;
      const res = await supervisorService.getLineasByChofer(choferId, token);
      if (res.success) {
        setAssignedLines((prev) => ({ ...prev, [choferId]: res.data }));
      }
    },
    [token]
  );

  const fetchAssignedLinesForAll = useCallback(async () => {
    if (!token) return;
    // fetch assignments for all choferes
    for (const c of choferes) {
      await fetchAssignedLinesForChofer(c.id);
    }
  }, [choferes, fetchAssignedLinesForChofer, token]);

  const fetchCatalogo = useCallback(async () => {
    if (!token) return;
    setLoadingFlag("catalogo", true);
    const res = await supervisorService.getCatalogoTurnos(token);
    if (res.success) setCatalogoTurnos(res.data);
    else setCatalogoTurnos([
      { id: 1, nombre: "Mañana" },
      { id: 2, nombre: "Tarde" },
      { id: 3, nombre: "Noche" },
    ]);
    setLoadingFlag("catalogo", false);
  }, [token]);

  useEffect(() => {
    if (isSupervisor && token) {
      fetchTurnos();
      fetchChoferes();
      fetchCatalogo();
    } else {
      setTurnos([]);
      setChoferes([]);
      setCatalogoTurnos([]);
    }
  }, [fetchTurnos, fetchChoferes, fetchCatalogo, isSupervisor, token]);

  // cuando la lista de choferes cambia, cargar sus asignaciones
  useEffect(() => {
    if (!isSupervisor || !token || choferes.length === 0) return;
    (async () => {
      try {
        await fetchAssignedLinesForAll();
      } catch (e) {
        console.error("Error cargando asignaciones iniciales:", e);
      }
    })();
  }, [choferes, fetchAssignedLinesForAll, isSupervisor, token]);

  const fetchMisTurnos = useCallback(async () => {
    if (!token) return;
    setLoadingFlag("misTurnos", true);
    const res = await choferService.getMisTurnos(token);
    if (res.success) setMisTurnos(res.data);
    else showError(res.error, "No se pudieron cargar tus turnos.");
    setLoadingFlag("misTurnos", false);
  }, [token]);

  const startEventStream = useCallback(() => {
    if (!token) return;
    eventSourceRef.current?.close();
    
    console.log("🔌 Conectando a SSE stream...");
    const source = turnosAuthService.openStream(token);
    
    source.addEventListener("turno-creado", (event) => {
      try {
        const data = JSON.parse((event as MessageEvent).data);
        console.log("✅ Evento turno-creado recibido:", data);
        setMisTurnos((prev) => [...prev, data]);
      } catch (error) {
        console.error("❌ Error al procesar SSE turno-creado:", error);
      }
    });
    
    source.addEventListener("turno-actualizado", (event) => {
      try {
        const data = JSON.parse((event as MessageEvent).data);
        console.log("🔄 Evento turno-actualizado recibido:", data);
        setMisTurnos((prev) =>
          prev.map((t) => (t.id === data.id ? { ...t, ...data } : t))
        );
      } catch (error) {
        console.error("❌ Error al procesar SSE turno-actualizado:", error);
      }
    });

    // Eventos relacionados a asignaciones de líneas
    source.addEventListener("chofer-linea-asignada", (event) => {
      try {
        const data = JSON.parse((event as MessageEvent).data);
        console.log("🔔 Evento chofer-linea-asignada:", data);
        // data should contain chofer_id or choferId
        const choferId = data.chofer_id ?? data.choferId ?? data.idUsuario ?? null;
        if (choferId) fetchAssignedLinesForChofer(Number(choferId));
      } catch (error) {
        console.error("Error procesando chofer-linea-asignada:", error);
      }
    });

    source.addEventListener("lineas-asignadas", (event) => {
      try {
        const data = JSON.parse((event as MessageEvent).data);
        console.log("🔔 Evento lineas-asignadas:", data);
        const choferId = data.chofer_id ?? data.chofer?.id ?? data.idUsuario ?? null;
        if (choferId) fetchAssignedLinesForChofer(Number(choferId));
      } catch (error) {
        console.error("Error procesando lineas-asignadas:", error);
      }
    });
    
    source.onopen = () => {
      console.log("✅ Conexión SSE establecida");
    };
    
    source.onerror = (error) => {
      console.error("❌ Error SSE:", error);
    };
    
    eventSourceRef.current = source;
  }, [token]);

  useEffect(() => {
    if (isChofer && token) {
      fetchMisTurnos();
      // cargar líneas asignadas del chofer actual
      if (session?.User?.id) fetchAssignedLinesForChofer(Number(session.User.id));
      startEventStream();
    } else {
      eventSourceRef.current?.close();
      setMisTurnos([]);
    }
  }, [fetchMisTurnos, isChofer, startEventStream, token]);

 

  const handleLogout = async () => {
    await turnosAuthService.logout();
    eventSourceRef.current?.close();
    setSession(null);
    setToken(undefined);
    setTurnos([]);
    setChoferes([]);
    setMisTurnos([]);
    setMessage("Sesión cerrada.");
  };

  const handleCreateChofer = async (payload: CreateChoferPayload): Promise<OperationResult> => {
    const res = await supervisorService.createChofer(payload, token);
    if (res.success) {
      setMessage("Chofer creado exitosamente.");
      fetchChoferes();
      return { success: true };
    }
    showError(res.error, "No se pudo crear el chofer.");
    return { success: false, error: res.error };
  };

  const handleUpdateTurno = async (turnoId: number, payload: UpdateTurnoPayload): Promise<OperationResult> => {
    const res = await supervisorService.updateTurno(turnoId, payload, token);
    if (res.success) {
      setMessage("Turno actualizado.");
      fetchTurnos();
      return { success: true };
    }
    showError(res.error, "No se pudo actualizar el turno.");
    return { success: false, error: res.error };
  };

  // 👇 Arreglo: debe recibir TurnoAsignado (no id), y usar turno.id
  const handleDeleteTurno = async (turno: TurnoAsignado) => {
    if (!window.confirm("¿Seguro que deseas eliminar este turno?")) return;
    const res = await supervisorService.deleteTurno(turno.id, token);
    if (res.success) {
      setMessage("Turno eliminado.");
      fetchTurnos();
    } else {
      showError(res.error, "No se pudo eliminar el turno.");
    }
  };

  const handleAssignTurno = async (choferId: number, payload: AssignTurnoPayload): Promise<OperationResult> => {
    const res = await supervisorService.assignTurno(choferId, payload, token);
    if (res.success) {
      setMessage("Turno asignado correctamente.");
      fetchTurnos();
      return { success: true };
    }
    showError(res.error, "No se pudo asignar el turno.");
    return { success: false, error: res.error };
  };

  const handleUpdateChofer = async (choferId: number, payload: UpdateChoferPayload): Promise<OperationResult> => {
    const res = await supervisorService.updateChofer(choferId, payload, token);
    if (res.success) {
      setMessage("Chofer actualizado.");
      fetchChoferes();
      return { success: true };
    }
    showError(res.error, "No se pudo actualizar el chofer.");
    return { success: false, error: res.error };
  };

  const handleDeleteChofer = async (choferId: number) => {
    if (!window.confirm("¿Seguro que deseas eliminar este chofer?")) return;
    const res = await supervisorService.deleteChofer(choferId, token);
    if (res.success) {
      setMessage("Chofer eliminado.");
      fetchChoferes();
    } else {
      showError(res.error, "No se pudo eliminar el chofer.");
    }
  };

  let bodyContent: ReactNode;

  if (loading.auth) {
    bodyContent = <p className="text-sm text-gray-600">Verificando sesión...</p>;
  } else if (isSupervisor) {
    bodyContent = (
      <>
        <SupervisorPanel
          turnos={turnos}
          choferes={choferes}
          assignedLines={assignedLines}
          loadingTurnos={loading.turnos}
          loadingChoferes={loading.choferes}
          onLogout={handleLogout}
          onEditTurno={setTurnoToEdit}
          onDeleteTurno={handleDeleteTurno}
          onAssignTurno={setChoferToAssign}
          onEditChofer={setChoferToEdit}
          onDeleteChofer={handleDeleteChofer}
          onCreateChofer={handleCreateChofer}
        />
        <ResponseMessage message={message} />
      </>
    );
  } else if (isChofer) {
    bodyContent = (
      <>
        <ChoferPanel
          turnos={misTurnos}
          loading={loading.misTurnos}
          onLogout={handleLogout}
          assignedLines={session?.User?.id ? assignedLines[Number(session.User.id)] : undefined}
        />
        <ResponseMessage message={message} />
      </>
    );
  } else {
    bodyContent = (
      <>
        <p className="px-4 py-2 text-sm text-yellow-900 border border-yellow-200 rounded bg-yellow-50">
          Tu rol aún no tiene un panel asignado.
        </p>
      </>
    );
  }

  return (
    <div className="flex flex-col max-w-5xl gap-6 p-6 px-4 pt-32 pb-16 mx-auto space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Sistema de turnos</h1>
      </header>

      {bodyContent}

      <UpdateTurnoModal
        turno={turnoToEdit}
        onClose={() => setTurnoToEdit(null)}
        onSave={handleUpdateTurno}
        catalogoTurnos={catalogoTurnos}
        loadingCatalogo={loading.catalogo}
      />

      <UpdateChoferModal
        chofer={choferToEdit}
        onClose={() => setChoferToEdit(null)}
        onSave={handleUpdateChofer}
      />

      <AssignTurnoModal
        chofer={choferToAssign}
        onClose={() => setChoferToAssign(null)}
        onAssign={handleAssignTurno}
        catalogoTurnos={catalogoTurnos}
        loadingCatalogo={loading.catalogo}
      />
    </div>
  );
}
