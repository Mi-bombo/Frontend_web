import { useMemo } from "react";
import { useSupervisorData } from "../../view/supervisor/SupervisorDataProvider";

export default function DashboardSupervisor() {
  const { choferes, turnos, loading, error, refresh } =
    useSupervisorData();

  const stats = useMemo(
    () => [
      { label: "Choferes activos", value: choferes.length },
      { label: "Turnos asignados", value: turnos.length },
      {
        label: "Días con servicio",
        value: new Set(turnos.map((t) => t.dia)).size,
      },
    ],
    [choferes.length, turnos]
  );

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-sm text-slate-500">Cargando información...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Dashboard del Supervisor</h1>
        <button
          type="button"
          onClick={refresh}
          className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700"
        >
          Actualizar datos
        </button>
      </div>

      {error && (
        <p className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl bg-white p-4 text-center shadow"
          >
            <p className="text-sm uppercase tracking-wide text-slate-500">
              {s.label}
            </p>
            <p className="text-3xl font-semibold text-slate-900">
              {s.value}
            </p>
          </div>
        ))}
      </div>

      <section className="rounded-2xl bg-white p-6 shadow">
        <h2 className="text-xl font-semibold text-slate-900">
          Últimos turnos asignados
        </h2>
        {turnos.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">
            Todavía no se registraron turnos asignados.
          </p>
        ) : (
          <table className="mt-4 w-full text-left text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="pb-2">Turno</th>
                <th className="pb-2">Chofer</th>
                <th className="pb-2">Día</th>
              </tr>
            </thead>
            <tbody>
              {turnos.slice(0, 5).map((turno) => (
                <tr key={turno.id} className="border-t text-slate-700">
                  <td className="py-2">{turno.nombre_turno}</td>
                  <td className="py-2">{turno.nombre_chofer}</td>
                  <td className="py-2">{turno.dia}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
