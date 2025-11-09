import { useMemo } from "react";
import { useSupervisorData } from "../../../view/supervisor/SupervisorDataProvider";

type Obstruccion = {
  id: number;
  descripcion: string;
  severidad: "Alta" | "Media" | "Baja";
  dia: string;
  chofer: string;
};

const getSeverity = (dia: string): Obstruccion["severidad"] => {
  if (/sab|dom/i.test(dia)) return "Media";
  if (/lun|mar|mie/i.test(dia)) return "Alta";
  return "Baja";
};

export default function PanelObstrucciones() {
  const {
    turnos,
    loadingTurnos,
    error,
    refreshTurnos,
  } = useSupervisorData();

  const obstrucciones = useMemo<Obstruccion[]>(
    () =>
      turnos.map((turno) => ({
        id: turno.id,
        descripcion: `Turno ${turno.nombre_turno}`,
        dia: turno.dia,
        chofer: turno.nombre_chofer,
        severidad: getSeverity(turno.dia),
      })),
    [turnos]
  );

  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Panel de obstrucciones</h1>
          <p className="text-sm text-slate-500">
            Se listan los turnos para monitorear posibles incidencias.
          </p>
        </div>
        <button
          type="button"
          onClick={refreshTurnos}
          className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700"
        >
          Actualizar
        </button>
      </div>

      {error && (
        <p className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="overflow-hidden rounded-lg bg-white shadow">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100 text-slate-600">
            <tr>
              <th className="p-3">Descripción</th>
              <th className="p-3">Chofer</th>
              <th className="p-3">Día</th>
              <th className="p-3">Severidad</th>
            </tr>
          </thead>
          <tbody>
            {loadingTurnos ? (
              <tr>
                <td colSpan={4} className="p-4 text-center text-slate-500">
                  Consultando turnos...
                </td>
              </tr>
            ) : obstrucciones.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-4 text-center text-slate-500">
                  No hay turnos registrados para supervisar.
                </td>
              </tr>
            ) : (
              obstrucciones.map((o) => (
                <tr key={o.id} className="border-t">
                  <td className="p-3">{o.descripcion}</td>
                  <td className="p-3">{o.chofer}</td>
                  <td className="p-3">{o.dia}</td>
                  <td className="p-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        o.severidad === "Alta"
                          ? "bg-red-100 text-red-600"
                          : o.severidad === "Media"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {o.severidad}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
