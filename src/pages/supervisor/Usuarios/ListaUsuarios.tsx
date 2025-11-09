import { useSupervisorData } from "../../../view/supervisor/SupervisorDataProvider";

export default function ListaUsuarios() {
  const {
    choferes,
    loadingChoferes,
    error,
    refreshChoferes,
  } = useSupervisorData();

  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Gestión de usuarios</h1>
          <p className="text-sm text-slate-500">
            Información obtenida desde los endpoints del supervisor.
          </p>
        </div>
        <button
          type="button"
          onClick={refreshChoferes}
          className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700"
        >
          Recargar
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
              <th className="p-3">ID</th>
              <th className="p-3">Nombre</th>
              <th className="p-3">Email</th>
            </tr>
          </thead>
          <tbody>
            {loadingChoferes ? (
              <tr>
                <td colSpan={3} className="p-4 text-center text-slate-500">
                  Cargando usuarios...
                </td>
              </tr>
            ) : choferes.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-4 text-center text-slate-500">
                  No hay choferes registrados todavía.
                </td>
              </tr>
            ) : (
              choferes.map((chofer) => (
                <tr key={chofer.id} className="border-t">
                  <td className="p-3">{chofer.id}</td>
                  <td className="p-3">{chofer.nombre}</td>
                  <td className="p-3">{chofer.email}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
