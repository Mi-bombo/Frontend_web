import type { TurnoAsignado } from "../../services/turnos/types";

type Props = {
  turnos: TurnoAsignado[];
  onEdit: (turno: TurnoAsignado) => void;
  onDelete: (id: number) => void;
};

export function TurnosList({ turnos, onEdit, onDelete }: Props) {
  if (!turnos.length) {
    return (
      <p className="rounded bg-gray-50 px-3 py-2 text-sm text-gray-600">
        No hay turnos asignados todavía.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {turnos.map((turno) => (
        <li
          key={turno.id}
          className="rounded border border-gray-200 p-3 shadow-sm"
        >
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Chofer:</span> {turno.nombre_chofer}
          </p>
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Turno:</span> {turno.nombre_turno}
          </p>
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Día:</span> {turno.dia}
          </p>
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => onEdit(turno)}
              className="rounded bg-blue-600 px-3 py-1 text-white"
            >
              Actualizar
            </button>
            <button
              onClick={() => onDelete(turno.id)}
              className="rounded bg-red-600 px-3 py-1 text-white"
            >
              Eliminar
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
