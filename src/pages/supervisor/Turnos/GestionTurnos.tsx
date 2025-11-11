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
    catalogoTurnos,
    loadingCatalogo,
  } = useSupervisorData();

  const ctx = authenticated();
  const logoutUser = (ctx as any)?.logoutUser;

  const [message, setMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [turnoToEdit, setTurnoToEdit] = useState<TurnoAsignado | null>(null);
  const [choferToEdit, setChoferToEdit] = useState<Chofer | null>(null);
  const [choferToAssign, setChoferToAssign] = useState<Chofer | null>(null);

  const ensureAuth = () => {
    setActionError(null);
    return true;
  };

  const handleCreateChofer = async (
    payload: CreateChoferPayload
  ): Promise<OperationResult> => {
    ensureAuth();
    const result = await supervisorService.createChofer(payload, token);
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
    ensureAuth();
    const result = await supervisorService.updateTurno(turnoId, payload, token);
    if (result.success) {
      setMessage("Turno actualizado.");
      await refreshTurnos();
      return { success: true };
    }
    setActionError(result.error ?? "No se pudo actualizar el turno.");
    return { success: false, error: result.error };
  };

  const handleDeleteTurno = async (turno: TurnoAsignado) => {
    if (!window.confirm("¿Eliminar este turno asignado?")) return;
    ensureAuth();
    const result = await supervisorService.deleteTurno(turno.id, token);
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
    ensureAuth();
    const result = await supervisorService.assignTurno(
      choferId,
      payload,
      token
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
    ensureAuth();
    const result = await supervisorService.updateChofer(
      choferId,
      payload,
      token
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
    ensureAuth();
    const result = await supervisorService.deleteChofer(choferId, token);
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

  const refreshAll = async () => {
    setActionError(null);
    await Promise.all([refreshChoferes(), refreshTurnos()]);
    setMessage("Datos actualizados.");
  };

  if (!isSupervisor) {
    return (
      <div className="p-6">
        <p className="px-4 py-2 text-sm text-yellow-900 border border-yellow-200 rounded bg-yellow-50">
          Necesitas permisos de supervisor para acceder a esta sección.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Gestión de turnos</h1>
          <p className="text-sm text-slate-500">
            Administra choferes, asignaciones y actualizaciones.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 text-xs rounded-full bg-slate-100 text-slate-700">
            Choferes: <strong>{choferes.length}</strong>
          </span>
          <span className="px-3 py-1 text-xs rounded-full bg-slate-100 text-slate-700">
            Turnos: <strong>{turnos.length}</strong>
          </span>
          <button
            type="button"
            onClick={refreshAll}
            className="px-4 py-2 text-sm font-semibold text-white transition-colors bg-blue-600 rounded-full shadow cursor-pointer hover:bg-blue-700 disabled:opacity-50 disabled:cursor-default"
            disabled={loadingChoferes || loadingTurnos}
          >
            {loadingChoferes || loadingTurnos
              ? "Actualizando..."
              : "Actualizar todo"}
          </button>
        </div>
      </div>

      {error && (
        <p className="p-3 text-sm text-red-700 border border-red-100 rounded-lg bg-red-50">
          {error}
        </p>
      )}
      {actionError && (
        <p className="p-3 text-sm text-red-700 border border-red-100 rounded-lg bg-red-50">
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

      <ResponseMessage message={message} onClose={() => setMessage(null)} />

      <UpdateTurnoModal
        turno={turnoToEdit}
        onClose={() => setTurnoToEdit(null)}
        onSave={handleUpdateTurno}
        catalogoTurnos={catalogoTurnos}
        loadingCatalogo={loadingCatalogo}
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
        loadingCatalogo={loadingCatalogo}
      />
    </div>
  );
}
