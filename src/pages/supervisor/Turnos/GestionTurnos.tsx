import { useState } from "react";
import { SupervisorPanel } from "../../../components/turnos/SupervisorPanel";
import { ResponseMessage } from "../../../components/turnos/ResponseMessage";
import { UpdateTurnoModal } from "../../../components/turnos/UpdateTurnoModal";
import { UpdateChoferModal } from "../../../components/turnos/UpdateChoferModal";
import { AssignTurnoModal } from "../../../components/turnos/AssignTurnoModal";
import { useSupervisorData } from "../../../view/supervisor/SupervisorDataProvider";
import { authenticated } from "../../../context/AppContext";
import { supervisorService } from "../../../services/turnos/supervisor.service";
import type {
  AssignTurnoPayload,
  Chofer,
  CreateChoferPayload,
  TurnoAsignado,
  UpdateChoferPayload,
  UpdateTurnoPayload,
} from "../../../services/turnos/types";

type OperationResult = { success: boolean; error?: string };

export default function GestionTurnos() {
  const {
    choferes,
    turnos,
    loadingChoferes,
    loadingTurnos,
    error,
    token,
    isSupervisor,
    refreshChoferes,
    refreshTurnos,
  } = useSupervisorData();

  const ctx = authenticated();
  const logoutUser = (ctx as any)?.logoutUser;

  const [message, setMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [turnoToEdit, setTurnoToEdit] = useState<TurnoAsignado | null>(null);
  const [choferToEdit, setChoferToEdit] = useState<Chofer | null>(null);
  const [choferToAssign, setChoferToAssign] = useState<Chofer | null>(null);

  const ensureToken = (): string | null => {
    if (!token) {
      setActionError("No se encontró el token de autenticación.");
      return null;
    }
    setActionError(null);
    return token;
  };

  const handleCreateChofer = async (
    payload: CreateChoferPayload
  ): Promise<OperationResult> => {
    const authToken = ensureToken();
    if (!authToken) {
      return { success: false, error: "Token requerido." };
    }
    const result = await supervisorService.createChofer(payload, authToken);
    if (result.success) {
      setMessage("Chofer creado correctamente.");
      await refreshChoferes();
      return { success: true };
    }
    setActionError(result.error ?? "No se pudo crear el chofer.");
    return { success: false, error: result.error };
  };

  const handleUpdateTurno = async (
    turnoId: number,
    payload: UpdateTurnoPayload
  ): Promise<OperationResult> => {
    const authToken = ensureToken();
    if (!authToken) {
      return { success: false, error: "Token requerido." };
    }
    const result = await supervisorService.updateTurno(
      turnoId,
      payload,
      authToken
    );
    if (result.success) {
      setMessage("Turno actualizado.");
      await refreshTurnos();
      return { success: true };
    }
    setActionError(result.error ?? "No se pudo actualizar el turno.");
    return { success: false, error: result.error };
  };

  const handleDeleteTurno = async (turnoId: number) => {
    if (!window.confirm("¿Eliminar este turno asignado?")) return;
    const authToken = ensureToken();
    if (!authToken) return;
    const result = await supervisorService.deleteTurno(turnoId, authToken);
    if (result.success) {
      setMessage("Turno eliminado.");
      await refreshTurnos();
    } else {
      setActionError(result.error ?? "No se pudo eliminar el turno.");
    }
  };

  const handleAssignTurno = async (
    choferId: number,
    payload: AssignTurnoPayload
  ): Promise<OperationResult> => {
    const authToken = ensureToken();
    if (!authToken) {
      return { success: false, error: "Token requerido." };
    }
    const result = await supervisorService.assignTurno(
      choferId,
      payload,
      authToken
    );
    if (result.success) {
      setMessage("Turno asignado correctamente.");
      await refreshTurnos();
      return { success: true };
    }
    setActionError(result.error ?? "No se pudo asignar el turno.");
    return { success: false, error: result.error };
  };

  const handleUpdateChofer = async (
    choferId: number,
    payload: UpdateChoferPayload
  ): Promise<OperationResult> => {
    const authToken = ensureToken();
    if (!authToken) {
      return { success: false, error: "Token requerido." };
    }
    const result = await supervisorService.updateChofer(
      choferId,
      payload,
      authToken
    );
    if (result.success) {
      setMessage("Chofer actualizado.");
      await refreshChoferes();
      return { success: true };
    }
    setActionError(result.error ?? "No se pudo actualizar el chofer.");
    return { success: false, error: result.error };
  };

  const handleDeleteChofer = async (choferId: number) => {
    if (!window.confirm("¿Eliminar este chofer?")) return;
    const authToken = ensureToken();
    if (!authToken) return;
    const result = await supervisorService.deleteChofer(
      choferId,
      authToken
    );
    if (result.success) {
      setMessage("Chofer eliminado.");
      await refreshChoferes();
    } else {
      setActionError(result.error ?? "No se pudo eliminar el chofer.");
    }
  };

  const handleLogout = async () => {
    if (typeof logoutUser === "function") {
      await logoutUser();
    }
  };

  if (!isSupervisor) {
    return (
      <div className="p-6">
        <p className="rounded border border-yellow-200 bg-yellow-50 px-4 py-2 text-sm text-yellow-900">
          Necesitas permisos de supervisor para acceder a esta sección.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {error && (
        <p className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}
      {actionError && (
        <p className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-700">
          {actionError}
        </p>
      )}

      <SupervisorPanel
        turnos={turnos}
        choferes={choferes}
        loadingTurnos={loadingTurnos}
        loadingChoferes={loadingChoferes}
        onLogout={handleLogout}
        onEditTurno={setTurnoToEdit}
        onDeleteTurno={handleDeleteTurno}
        onAssignTurno={setChoferToAssign}
        onEditChofer={setChoferToEdit}
        onDeleteChofer={handleDeleteChofer}
        onCreateChofer={handleCreateChofer}
      />

      <ResponseMessage message={message} />

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
