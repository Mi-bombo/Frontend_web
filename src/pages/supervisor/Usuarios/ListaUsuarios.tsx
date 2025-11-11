import { useEffect, useMemo, useState } from "react";
import { useSupervisorData } from "../../../view/supervisor/SupervisorDataProvider";
import Pagination from "../../../components/Pagination";
import Modal from "../../../components/Modal";
import type { Chofer } from "../../../services/turnos/types";

export default function ListaUsuarios() {
  const {
    choferes,
    loadingChoferes,
    error,
    refreshChoferes,
  } = useSupervisorData();

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<Chofer | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return choferes;
    return choferes.filter(
      (c) =>
        c.nombre?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        String(c.id).includes(q)
    );
  }, [choferes, query]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [query, pageSize]);

  const handleExportCSV = () => {
    const header = ["id", "nombre", "email"];
    const rows = filtered.map((c) => [c.id, c.nombre ?? "", c.email ?? ""]);
    const csv =
      [header, ...rows]
        .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
        .join("\n") + "\n";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "usuarios.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Gestión de usuarios</h1>
          <p className="text-sm text-slate-500">
            Información obtenida desde los endpoints del supervisor.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre, email o ID…"
              className="px-4 py-2 text-sm border rounded-full pr-9"
            />
          </div>

          <button
            type="button"
            onClick={refreshChoferes}
            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-full shadow cursor-pointer hover:bg-blue-700"
          >
            Recargar
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-4 py-2 text-sm font-semibold border rounded-full cursor-pointer hover:bg-slate-50"
          >
            Exportar CSV
          </button>
        </div>
      </div>

      {error && (
        <p className="p-3 text-sm text-red-700 border border-red-100 rounded-lg bg-red-50">
          {error}
        </p>
      )}

      <div className="overflow-hidden bg-white rounded-lg shadow">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 text-slate-600">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Nombre</th>
              <th className="p-3">Email</th>
              <th className="p-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loadingChoferes ? (
              <tr>
                <td colSpan={4} className="p-4 text-center text-slate-500">
                  Cargando usuarios…
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-500">
                  {query
                    ? "Sin resultados para tu búsqueda."
                    : "No hay choferes registrados todavía."}
                </td>
              </tr>
            ) : (
              paginated.map((c) => (
                <tr key={c.id} className="border-t hover:bg-slate-50/60">
                  <td className="p-3">{c.id}</td>
                  <td className="p-3">{c.nombre}</td>
                  <td className="p-3">{c.email}</td>
                  <td className="p-3">
                    <div className="flex justify-end">
                      <button
                        onClick={() => setSelected(c)}
                        className="px-3 py-1 text-xs font-semibold border rounded-full hover:bg-slate-50"
                      >
                        Ver
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <Pagination
          page={page}
          pageSize={pageSize}
          total={filtered.length}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title="Detalle de usuario"
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <button
              className="rounded-lg border px-3 py-1.5 text-sm hover:bg-slate-50"
              onClick={() => setSelected(null)}
            >
              Cerrar
            </button>
          </div>
        }
      >
        {selected && (
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-3 gap-2">
              <span className="text-slate-500">ID</span>
              <span className="col-span-2 font-medium">{selected.id}</span>

              <span className="text-slate-500">Nombre</span>
              <span className="col-span-2 font-medium">
                {selected.nombre ?? "-"}
              </span>

              <span className="text-slate-500">Email</span>
              <span className="col-span-2 font-medium">
                {selected.email ?? "-"}
              </span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
