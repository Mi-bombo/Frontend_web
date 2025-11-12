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
  assignedLines?: Record<number, Array<{ id: number; nombre: string }>>;
  loadingTurnos?: boolean;
  loadingChoferes?: boolean;
  onLogout?: () => void;
  onEditTurno: (turno: TurnoAsignado) => void;
  onDeleteTurno: (turno: TurnoAsignado) => void; 
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
  assignedLines,
  loadingTurnos,
  loadingChoferes,
  onEditTurno,
  onDeleteTurno,
  onAssignTurno,
  onEditChofer,
  onDeleteChofer,
  onCreateChofer,
}: Props) {
  return (
    <section className="p-6 space-y-6 bg-white border border-gray-200 rounded-lg shadow-sm">
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
              assignedLines={assignedLines}
            />
          )}
        </div>
      </div>

      <CreateChoferForm onSubmit={onCreateChofer} />
    </section>
  );
}
