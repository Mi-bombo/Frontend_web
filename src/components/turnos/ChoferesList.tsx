import type { Chofer } from "../../services/turnos/types";

type Props = {
  choferes: Chofer[];
  onAssign: (chofer: Chofer) => void;
  onEdit: (chofer: Chofer) => void;
  onDelete: (id: number) => void;
};

export function ChoferesList({ choferes, onAssign, onEdit, onDelete }: Props) {
  if (!choferes.length) {
    return (
      <p className="rounded bg-gray-50 px-3 py-2 text-sm text-gray-600">
        No hay choferes registrados.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {choferes.map((chofer) => (
        <li
          key={chofer.id}
          className="rounded border border-gray-200 p-3 shadow-sm"
        >
          <p className="text-sm text-gray-700">
            <span className="font-semibold">{chofer.nombre}</span> ({chofer.email})
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              onClick={() => onAssign(chofer)}
              className="rounded bg-indigo-600 px-3 py-1 text-white"
            >
              Asignar turno
            </button>
            <button
              onClick={() => onEdit(chofer)}
              className="rounded bg-blue-600 px-3 py-1 text-white"
            >
              Editar
            </button>
            <button
              onClick={() => onDelete(chofer.id)}
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
