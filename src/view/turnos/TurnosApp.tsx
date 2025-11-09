import type { ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { AuthSection } from "../../components/turnos/AuthSection";
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
  LoginPayload,
  RegisterPayload,
  SessionResponse,
  TurnoAsignado,
  TurnoChofer,
  UpdateChoferPayload,
  UpdateTurnoPayload,
} from "../../services/turnos/types";

type OperationResult = { success: boolean; error?: string };

const initialLoadingState = {
  auth: true,
  turnos: false,
  choferes: false,
  misTurnos: false,
};

export default function TurnosApp() {
  const [session, setSession] = useState<SessionResponse | null>(null);
  const [token, setToken] = useState<string | undefined>();
  const [message, setMessage] = useState<string | null>(null);
  const [turnos, setTurnos] = useState<TurnoAsignado[]>([]);
  const [choferes, setChoferes] = useState<Chofer[]>([]);
  const [misTurnos, setMisTurnos] = useState<TurnoChofer[]>([]);
  const [loading, setLoading] = useState(initialLoadingState);
  const [turnoToEdit, setTurnoToEdit] = useState<TurnoAsignado | null>(null);
  const [choferToEdit, setChoferToEdit] = useState<Chofer | null>(null);
  const [choferToAssign, setChoferToAssign] = useState<Chofer | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const setLoadingFlag = (key: keyof typeof loading, value: boolean) => {
    setLoading((prev) => ({ ...prev, [key]: value }));
  };

  const showError = (
    error?: string,
    fallback = "Ocurrió un error inesperado."
  ) => {
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
    return () => {
      eventSourceRef.current?.close();
    };
  }, [refreshSession]);

  const fetchTurnos = useCallback(async () => {
    if (!token) return;
    setLoadingFlag("turnos", true);
    const res = await supervisorService.getTurnos(token);
    if (res.success) {
      setTurnos(res.data);
    } else {
      showError(res.error, "No se pudieron cargar los turnos.");
    }
    setLoadingFlag("turnos", false);
  }, [token]);

  const fetchChoferes = useCallback(async () => {
    if (!token) return;
    setLoadingFlag("choferes", true);
    const res = await supervisorService.getChoferes(token);
    if (res.success) {
      setChoferes(res.data);
    } else {
      showError(res.error, "No se pudieron cargar los choferes.");
    }
    setLoadingFlag("choferes", false);
  }, [token]);

  useEffect(() => {
    if (isSupervisor && token) {
      fetchTurnos();
      fetchChoferes();
    } else {
      setTurnos([]);
      setChoferes([]);
    }
  }, [fetchTurnos, fetchChoferes, isSupervisor, token]);

  const fetchMisTurnos = useCallback(async () => {
    if (!token) return;
    setLoadingFlag("misTurnos", true);
    const res = await choferService.getMisTurnos(token);
    if (res.success) {
      setMisTurnos(res.data);
    } else {
      showError(res.error, "No se pudieron cargar tus turnos.");
    }
    setLoadingFlag("misTurnos", false);
  }, [token]);

  const startEventStream = useCallback(() => {
    if (!token) return;
    eventSourceRef.current?.close();
    const source = turnosAuthService.openStream(token);
    source.addEventListener("turno-creado", (event) => {
      try {
        const data = JSON.parse((event as MessageEvent).data);
        setMisTurnos((prev) => [...prev, data]);
      } catch (error) {
        console.error("Error al procesar SSE", error);
      }
    });
    source.onerror = (error) => {
      console.error("Error SSE", error);
    };
    eventSourceRef.current = source;
  }, [token]);

  useEffect(() => {
    if (isChofer && token) {
      fetchMisTurnos();
      startEventStream();
    } else {
      eventSourceRef.current?.close();
      setMisTurnos([]);
    }
  }, [fetchMisTurnos, isChofer, startEventStream, token]);

  const handleRegister = async (
    payload: RegisterPayload
  ): Promise<OperationResult> => {
    const res = await turnosAuthService.register(payload);
    if (res.success) {
      setMessage("Registro exitoso. Ahora puedes iniciar sesión.");
      return { success: true };
    }
    showError(res.error, "No se pudo completar el registro.");
    return { success: false, error: res.error };
  };

  const handleLogin = async (
    payload: LoginPayload
  ): Promise<OperationResult> => {
    const res = await turnosAuthService.login(payload);
    if (res.success) {
      setMessage("Inicio de sesión exitoso.");
      await refreshSession();
      return { success: true };
    }
    showError(res.error, "No se pudo iniciar sesión.");
    return { success: false, error: res.error };
  };

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

  const handleCreateChofer = async (
    payload: CreateChoferPayload
  ): Promise<OperationResult> => {
    const res = await supervisorService.createChofer(payload, token);
    if (res.success) {
      setMessage("Chofer creado exitosamente.");
      fetchChoferes();
      return { success: true };
    }
    showError(res.error, "No se pudo crear el chofer.");
    return { success: false, error: res.error };
  };

  const handleUpdateTurno = async (
    turnoId: number,
    payload: UpdateTurnoPayload
  ): Promise<OperationResult> => {
    const res = await supervisorService.updateTurno(turnoId, payload, token);
    if (res.success) {
      setMessage("Turno actualizado.");
      fetchTurnos();
      return { success: true };
    }
    showError(res.error, "No se pudo actualizar el turno.");
    return { success: false, error: res.error };
  };

  const handleDeleteTurno = async (turnoId: number) => {
    if (!window.confirm("¿Seguro que deseas eliminar este turno?")) return;
    const res = await supervisorService.deleteTurno(turnoId, token);
    if (res.success) {
      setMessage("Turno eliminado.");
      fetchTurnos();
    } else {
      showError(res.error, "No se pudo eliminar el turno.");
    }
  };

  const handleAssignTurno = async (
    choferId: number,
    payload: AssignTurnoPayload
  ): Promise<OperationResult> => {
    const res = await supervisorService.assignTurno(choferId, payload, token);
    if (res.success) {
      setMessage("Turno asignado correctamente.");
      fetchTurnos();
      return { success: true };
    }
    showError(res.error, "No se pudo asignar el turno.");
    return { success: false, error: res.error };
  };

  const handleUpdateChofer = async (
    choferId: number,
    payload: UpdateChoferPayload
  ): Promise<OperationResult> => {
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
    bodyContent = (
      <p className="text-sm text-gray-600">Verificando sesión...</p>
    );
  } else if (!session?.User) {
    bodyContent = (
      <AuthSection
        onRegister={handleRegister}
        onLogin={handleLogin}
        message={message}
      />
    );
  } else if (isSupervisor) {
    bodyContent = (
      <>
        <SupervisorPanel
          turnos={turnos}
          choferes={choferes}
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
        />
        <ResponseMessage message={message} />
      </>
    );
  } else {
    bodyContent = (
      <>
        <p className="rounded border border-yellow-200 bg-yellow-50 px-4 py-2 text-sm text-yellow-900">
          Tu rol aún no tiene un panel asignado.
        </p>
        <button
          onClick={handleLogout}
          className="rounded bg-red-600 px-4 py-2 text-white"
        >
          Cerrar sesión
        </button>
      </>
    );
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 pt-32 pb-16  space-y-6 p-6">
      <header>
        <h1 className="text-3xl font-bold">Sistema de turnos</h1>
        <p className="text-sm text-gray-600">
          Gestiona supervisores y choferes desde una interfaz React modular.
        </p>
      </header>

      {bodyContent}

      <UpdateTurnoModal
        turno={turnoToEdit}
        onClose={() => setTurnoToEdit(null)}
        onSave={handleUpdateTurno}
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
      />
    </div>
  );
}
