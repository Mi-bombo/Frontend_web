import type { TurnoChofer } from "../../services/turnos/types";

type Props = {
  turnos: TurnoChofer[];
  loading?: boolean;
  onLogout: () => void;
};

export function ChoferPanel({ turnos, loading, onLogout }: Props) {
  return (
    <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Panel del Chofer</h2>
        <button
          onClick={onLogout}
          className="rounded bg-red-600 px-4 py-2 text-white"
        >
          Cerrar sesión
        </button>
      </div>

      <h3 className="text-lg font-semibold">Mis turnos</h3>
      {loading ? (
        <p className="text-sm text-gray-600">Cargando turnos...</p>
      ) : turnos.length ? (
        <ul className="space-y-2">
          {turnos.map((turno, index) => (
            <li
              key={`${turno.id ?? index}-${turno.dia}`}
              className="rounded border border-gray-100 bg-gray-50 px-3 py-2 text-sm"
            >
              Turno: {turno.nombre_turno} · Día: {turno.dia}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-600">Esperando asignaciones...</p>
      )}
    </section>
  );
}
