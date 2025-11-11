import { useEffect, useMemo, useState } from "react";
import Pagination from "../Pagination";
import type { Chofer } from "../../services/turnos/types";

type Props = {
  choferes: Chofer[];
  onAssign: (chofer: Chofer) => void;
  onEdit: (chofer: Chofer) => void;
  onDelete: (id: number) => void;
};

export function ChoferesList({ choferes, onAssign, onEdit, onDelete }: Props) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(choferes.length / pageSize));
    if (page > totalPages) setPage(totalPages);
  }, [choferes.length, page, pageSize]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return choferes.slice(start, start + pageSize);
  }, [choferes, page, pageSize]);

  return (
    <div className="overflow-hidden bg-white border rounded-lg border-slate-200">
      {choferes.length === 0 ? (
        <p className="p-4 text-sm text-center text-slate-500">No hay choferes registrados.</p>
      ) : (
        <ul className="divide-y">
          {paginated.map((chofer) => (
            <li key={chofer.id} className="p-3 hover:bg-slate-50/60">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">{chofer.nombre}</span> ({chofer.email})
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                <button
                  onClick={() => onAssign(chofer)}
                  className="px-3 py-1 text-xs font-semibold text-white bg-indigo-600 rounded-full cursor-pointer hover:bg-indigo-700"
                >
                  Asignar turno
                </button>
                <button
                  onClick={() => onEdit(chofer)}
                  className="px-3 py-1 text-xs font-semibold text-white bg-blue-600 rounded-full cursor-pointer hover:bg-blue-700"
                >
                  Editar
                </button>
                <button
                  onClick={() => onDelete(chofer.id)}
                  className="px-3 py-1 text-xs font-semibold text-white bg-red-600 rounded-full cursor-pointer hover:bg-red-700"
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Pagination
        page={page}
        pageSize={pageSize}
        total={choferes.length}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        pageSizeOptions={[5, 10, 20]}
      />
    </div>
  );
}
