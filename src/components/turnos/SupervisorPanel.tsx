import { ChoferesList } from "./ChoferesList";
import { TurnosList } from "./TurnosList";
import { CreateChoferForm } from "./CreateChoferForm";
import type {
  Chofer,
  CreateChoferPayload,
  TurnoAsignado,
} from "../../services/turnos/types";

type Props = {
  turnos: TurnoAsignado[];
  choferes: Chofer[];
  loadingTurnos?: boolean;
  loadingChoferes?: boolean;
  onLogout: () => void;
  onEditTurno: (turno: TurnoAsignado) => void;
  onDeleteTurno: (id: number) => void;
  onAssignTurno: (chofer: Chofer) => void;
  onEditChofer: (chofer: Chofer) => void;
  onDeleteChofer: (id: number) => void;
  onCreateChofer: (
    payload: CreateChoferPayload
  ) => Promise<{ success: boolean; error?: string }>;
};

export function SupervisorPanel({
  turnos,
  choferes,
  loadingTurnos,
  loadingChoferes,
  onLogout,
  onEditTurno,
  onDeleteTurno,
  onAssignTurno,
  onEditChofer,
  onDeleteChofer,
  onCreateChofer,
}: Props) {
  return (
    <section className="space-y-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Panel del supervisor</h2>
        <button
          onClick={onLogout}
          className="rounded bg-red-600 px-4 py-2 text-white"
        >
          Cerrar sesión
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="mb-2 text-lg font-semibold">Turnos asignados</h3>
          {loadingTurnos ? (
            <p className="text-sm text-gray-600">Cargando turnos...</p>
          ) : (
            <TurnosList
              turnos={turnos}
              onEdit={onEditTurno}
              onDelete={onDeleteTurno}
            />
          )}
        </div>

        <div>
          <h3 className="mb-2 text-lg font-semibold">Choferes</h3>
          {loadingChoferes ? (
            <p className="text-sm text-gray-600">Cargando choferes...</p>
          ) : (
            <ChoferesList
              choferes={choferes}
              onAssign={onAssignTurno}
              onEdit={onEditChofer}
              onDelete={onDeleteChofer}
            />
          )}
        </div>
      </div>

      <CreateChoferForm onSubmit={onCreateChofer} />
    </section>
  );
}
