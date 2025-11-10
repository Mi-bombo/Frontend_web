import { useMemo, useState, useEffect } from "react";
import Pagination from "../Pagination";
import type { TurnoAsignado } from "../../services/turnos/types";

type Props = {
  turnos: TurnoAsignado[];
  onEdit: (turno: TurnoAsignado) => void;
  onDelete: (turno: TurnoAsignado) => void;
};

export function TurnosList({ turnos, onEdit, onDelete }: Props) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(turnos.length / pageSize));
    if (page > totalPages) setPage(totalPages);
  }, [turnos.length, page, pageSize]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return turnos.slice(start, start + pageSize);
  }, [turnos, page, pageSize]);

  return (
    <div className="overflow-hidden border rounded-lg border-slate-200">
      <table className="w-full text-sm text-left bg-white">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="p-3">ID</th>
            <th className="p-3">Fecha</th>
            <th className="p-3">Turno</th>
            <th className="p-3">Chofer</th>
            <th className="p-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {paginated.length === 0 ? (
            <tr>
              <td colSpan={4} className="p-6 text-center text-slate-500">
                No hay turnos asignados.
              </td>
            </tr>
          ) : (
            paginated.map((t) => (
              <tr key={t.id} className="border-t hover:bg-slate-50/60">
                <td className="p-3">{t.id}</td>
                <td className="p-3">{t.fecha ?? "—"}</td>
                <td className="p-3">{t.nombre_turno}</td>
                <td className="p-3">{t.nombre_chofer}</td>
                <td className="p-3">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onEdit(t)}
                      className="px-3 py-1 text-xs font-semibold border rounded-full cursor-pointer hover:bg-slate-50"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => onDelete(t)}
                      className="px-3 py-1 text-xs font-semibold text-red-700 border rounded-full cursor-pointer hover:bg-red-50"
                    >
                      Eliminar
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
        total={turnos.length}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        pageSizeOptions={[5, 10, 20]}
      />
    </div>
  );
}
