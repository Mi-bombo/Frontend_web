import { useMemo, useState, useEffect } from "react";
import { useSupervisorData } from "../../../view/supervisor/SupervisorDataProvider";
import Pagination from "../../../components/Pagination";
import Modal from "../../../components/Modal";

type Obstruccion = {
  id: number | string;
  descripcion: string;
  severidad: "Alta" | "Media" | "Baja";
  dia: string;
  chofer: string;
};

const getTurnoNombre = (t: any): string =>
  t?.nombre_turno ??
  t?.turno_nombre ??
  t?.turnoName ??
  t?.nombreTurno ??
  t?.turno?.nombre ??
  t?.turno ??
  "";

const getChoferNombre = (t: any): string =>
  t?.nombre_chofer ??
  t?.chofer_nombre ??
  t?.choferName ??
  t?.nombreChofer ??
  t?.chofer?.nombre ??
  t?.usuario?.nombre ??
  "";

const diaDesdeFecha = (yyyyMMdd?: string): string => {
  if (!yyyyMMdd) return "";
  const d = new Date(`${yyyyMMdd}T00:00:00`);
  const n = d.getDay();
  return ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"][n] ?? "";
};

const getDia = (t: any): string => {
  const fecha = t?.fecha ?? t?.date ?? t?.fecha_turno ?? "";
  if (fecha) return diaDesdeFecha(String(fecha));

  const raw = t?.dia ?? t?.day ?? t?.dia_semana ?? "";
  const s = String(raw).toLowerCase();
  if (!s) return "";
  if (s.startsWith("lun") || s === "1" || s === "monday" || s === "mon")
    return "Lun";
  if (s.startsWith("mar") || s === "2" || s === "tuesday" || s === "tue")
    return "Mar";
  if (
    s.startsWith("mie") ||
    s.startsWith("mié") ||
    s === "3" ||
    s === "wednesday" ||
    s === "wed"
  )
    return "Mie";
  if (s.startsWith("jue") || s === "4" || s === "thursday" || s === "thu")
    return "Jue";
  if (s.startsWith("vie") || s === "5" || s === "friday" || s === "fri")
    return "Vie";
  if (
    s.startsWith("sab") ||
    s.startsWith("sáb") ||
    s === "6" ||
    s === "saturday" ||
    s === "sat"
  )
    return "Sab";
  if (
    s.startsWith("dom") ||
    s === "0" ||
    s === "7" ||
    s === "sunday" ||
    s === "sun"
  )
    return "Dom";
  return raw;
};

const getSeverity = (dia: string): Obstruccion["severidad"] => {
  if (/sab|dom/i.test(dia)) return "Media";
  if (/lun|mar|mie/i.test(dia)) return "Alta";
  return "Baja";
};

export default function PanelObstrucciones() {
  const { turnos, loadingTurnos, error, refreshTurnos } = useSupervisorData();

  useEffect(() => {
    if (turnos?.length) {
      console.debug("[PanelObstrucciones] ejemplos:", turnos.slice(0, 3));
    }
  }, [turnos]);

  const obstrucciones = useMemo<Obstruccion[]>(
    () =>
      (turnos as any[]).map((t, idx) => {
        const dia = getDia(t);
        const desc = `Turno ${getTurnoNombre(t) || "(sin nombre)"}`;
        return {
          id: t?.id ?? `${getTurnoNombre(t)}-${idx}`,
          descripcion: desc,
          dia: dia || "—",
          chofer: getChoferNombre(t) || "—",
          severidad: getSeverity(dia || ""),
        };
      }),
    [turnos]
  );

  const [sev, setSev] = useState<"Todas" | "Alta" | "Media" | "Baja">("Todas");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sel, setSel] = useState<Obstruccion | null>(null);

  const filtered = useMemo(() => {
    if (sev === "Todas") return obstrucciones;
    return obstrucciones.filter((o) => o.severidad === sev);
  }, [obstrucciones, sev]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    if (page > totalPages) setPage(totalPages);
  }, [filtered.length, page, pageSize]);

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Panel de obstrucciones</h1>
          <p className="text-sm text-slate-500">
            Se listan los turnos para monitorear posibles incidencias.
          </p>
        </div>
        <button className="bg-blue-600 text-white font-semibold rounded-3xl p-2">
          Notificar obstrucción
        </button>

        <div className="flex items-center gap-2">
          <div className="flex overflow-x-auto bg-white border rounded-full">
            {(["Todas", "Alta", "Media", "Baja"] as const).map((s) => (
              <button
                key={s}
                className={`px-3 py-1.5 text-sm ${
                  sev === s ? "bg-slate-100 font-semibold" : ""
                }`}
                onClick={() => setSev(s)}
              >
                {s}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={refreshTurnos}
            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-full shadow hover:bg-blue-700"
          >
            Actualizar
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
              <th className="p-3">Descripción</th>
              <th className="p-3">Chofer</th>
              <th className="p-3">Día</th>
              <th className="p-3">Severidad</th>
              <th className="p-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loadingTurnos ? (
              <tr>
                <td colSpan={5} className="p-4 text-center text-slate-500">
                  Consultando turnos…
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">
                  No hay turnos registrados para supervisar.
                </td>
              </tr>
            ) : (
              paginated.map((o) => (
                <tr key={o.id} className="border-t hover:bg-slate-50/60">
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
                  <td className="p-3">
                    <div className="flex justify-end">
                      <button
                        onClick={() => setSel(o)}
                        className="px-3 py-1 text-xs font-semibold border rounded-full hover:bg-slate-50"
                      >
                        Ver detalle
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
        isOpen={!!sel}
        onClose={() => setSel(null)}
        title="Detalle de obstrucción"
        size="sm"
        footer={
          <div className="flex justify-end">
            <button
              className="rounded-lg border px-3 py-1.5 text-sm hover:bg-slate-50"
              onClick={() => setSel(null)}
            >
              Cerrar
            </button>
          </div>
        }
      >
        {sel && (
          <div className="grid grid-cols-3 gap-2 text-sm">
            <span className="text-slate-500">Descripción</span>
            <span className="col-span-2 font-medium">{sel.descripcion}</span>

            <span className="text-slate-500">Chofer</span>
            <span className="col-span-2 font-medium">{sel.chofer}</span>

            <span className="text-slate-500">Día</span>
            <span className="col-span-2 font-medium">{sel.dia}</span>

            <span className="text-slate-500">Severidad</span>
            <span className="col-span-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  sel.severidad === "Alta"
                    ? "bg-red-100 text-red-600"
                    : sel.severidad === "Media"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {sel.severidad}
              </span>
            </span>
          </div>
        )}
      </Modal>
    </div>
  );
}
