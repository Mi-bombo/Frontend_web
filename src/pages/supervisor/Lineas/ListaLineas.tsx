import { useMemo } from "react";
import { useSupervisorData } from "../../../view/supervisor/SupervisorDataProvider";

type LineaResumen = {
  nombre: string;
  asignados: number;
  dias: string[];
};

export default function ListaLineas() {
  const { turnos, loading, error, refresh } = useSupervisorData();

  const lineas = useMemo<LineaResumen[]>(() => {
    const map = new Map<string, { asignados: number; dias: Set<string> }>();

    turnos.forEach((turno) => {
      if (!map.has(turno.nombre_turno)) {
        map.set(turno.nombre_turno, { asignados: 0, dias: new Set() });
      }
      const ref = map.get(turno.nombre_turno)!;
      ref.asignados += 1;
      ref.dias.add(turno.dia);
    });

    return Array.from(map.entries()).map(([nombre, data]) => ({
      nombre,
      asignados: data.asignados,
      dias: Array.from(data.dias),
    }));
  }, [turnos]);

  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Líneas y turnos</h1>
          <p className="text-sm text-slate-500">
            Resumen armado con los turnos asignados.
          </p>
        </div>
        <button
          type="button"
          onClick={refresh}
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
              <th className="p-3">Turno</th>
              <th className="p-3">Choferes asignados</th>
              <th className="p-3">Días</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="p-4 text-center text-slate-500">
                  Cargando líneas...
                </td>
              </tr>
            ) : lineas.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-4 text-center text-slate-500">
                  No hay turnos para mostrar.
                </td>
              </tr>
            ) : (
              lineas.map((linea) => (
                <tr key={linea.nombre} className="border-t">
                  <td className="p-3">{linea.nombre}</td>
                  <td className="p-3">{linea.asignados}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      {linea.dias.map((dia) => (
                        <span
                          key={dia}
                          className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
                        >
                          {dia}
                        </span>
                      ))}
                    </div>
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
