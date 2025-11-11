import { useMemo, useState, useEffect } from "react";
import { useSupervisorData } from "../../../view/supervisor/SupervisorDataProvider";
import Pagination from "../../../components/Pagination";
import Modal from "../../../components/Modal";
import type { TurnoAsignado } from "../../../services/turnos/types";

type LineaResumen = {
  nombre: string;
  asignados: number;
  dias: string[];
};

const DAY_CHIPS = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"] as const;

const getTurnoNombre = (t: any): string =>
  t?.nombre_turno ??
  t?.turno_nombre ??
  t?.turnoName ??
  t?.nombreTurno ??
  t?.turno?.nombre ??
  t?.turno ??
  "";

const getDia = (t: any): string => {
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

const getChoferNombre = (t: any): string =>
  t?.nombre_chofer ??
  t?.chofer_nombre ??
  t?.choferName ??
  t?.nombreChofer ??
  t?.chofer?.nombre ??
  t?.usuario?.nombre ??
  "";

export default function ListaLineas() {
  const { turnos, loadingTurnos, error, refreshTurnos } = useSupervisorData();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dayFilter, setDayFilter] = useState<string>("Todos");
  const [openLinea, setOpenLinea] = useState<LineaResumen | null>(null);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(turnos.length / pageSize));
    if (page > totalPages) setPage(totalPages);
  }, [turnos.length, page, pageSize]);

  const lineas = useMemo<LineaResumen[]>(() => {
    const map = new Map<string, { asignados: number; dias: Set<string> }>();
    (turnos as any[]).forEach((t) => {
      const nombreTurno = getTurnoNombre(t);
      if (!nombreTurno) return;
      if (!map.has(nombreTurno)) {
        map.set(nombreTurno, { asignados: 0, dias: new Set() });
      }
      const ref = map.get(nombreTurno)!;
      ref.asignados += 1;

      const d = getDia(t);
      if (d) ref.dias.add(d);
    });

    return Array.from(map.entries()).map(([nombre, data]) => ({
      nombre,
      asignados: data.asignados,
      dias: Array.from(data.dias),
    }));
  }, [turnos]);

  const filtered = useMemo(() => {
    if (dayFilter === "Todos") return lineas;
    return lineas.filter((l) =>
      l.dias.some((d) => d.toLowerCase().startsWith(dayFilter.toLowerCase()))
    );
  }, [lineas, dayFilter]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const turnosDeLinea = (nombreLinea: string): TurnoAsignado[] =>
    (turnos as any[]).filter((t) => getTurnoNombre(t) === nombreLinea);

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Líneas y turnos</h1>
          <p className="text-sm text-slate-500">
            Resumen armado con los turnos asignados.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex overflow-x-auto bg-white border rounded-full">
            <button
              className={`px-3 py-1.5 text-sm ${
                dayFilter === "Todos" ? "bg-slate-100 font-semibold" : ""
              }`}
              onClick={() => setDayFilter("Todos")}
            >
              Todos
            </button>
            {DAY_CHIPS.map((d) => (
              <button
                key={d}
                className={`px-3 py-1.5 text-sm ${
                  dayFilter === d ? "bg-slate-100 font-semibold" : ""
                }`}
                onClick={() => setDayFilter(d)}
              >
                {d}
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
              <th className="p-3">Turno</th>
              <th className="p-3">Choferes asignados</th>
              <th className="p-3">Días</th>
              <th className="p-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loadingTurnos ? (
              <tr>
                <td colSpan={4} className="p-4 text-center text-slate-500">
                  Cargando líneas…
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-500">
                  No hay turnos para mostrar.
                </td>
              </tr>
            ) : (
              paginated.map((l) => (
                <tr key={l.nombre} className="border-t hover:bg-slate-50/60">
                  <td className="p-3">{l.nombre}</td>
                  <td className="p-3">{l.asignados}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      {l.dias.map((dia) => (
                        <span
                          key={dia}
                          className="px-3 py-1 text-xs font-semibold text-blue-700 rounded-full bg-blue-50"
                        >
                          {dia}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end">
                      <button
                        onClick={() => setOpenLinea(l)}
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
        isOpen={!!openLinea}
        onClose={() => setOpenLinea(null)}
        title={openLinea ? `Detalle: ${openLinea.nombre}` : "Detalle de línea"}
        size="lg"
        footer={
          <div className="flex justify-end">
            <button
              className="rounded-lg border px-3 py-1.5 text-sm hover:bg-slate-50"
              onClick={() => setOpenLinea(null)}
            >
              Cerrar
            </button>
          </div>
        }
      >
        {openLinea && (
          <div className="space-y-3">
            <div className="text-sm text-slate-600">
              Días:{" "}
              {openLinea.dias.map((d) => (
                <span
                  key={d}
                  className="mr-2 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold"
                >
                  {d}
                </span>
              ))}
            </div>

            <div className="overflow-hidden border rounded-lg">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="p-2">Chofer</th>
                    <th className="p-2">Día</th>
                  </tr>
                </thead>
                <tbody>
                  {turnosDeLinea(openLinea.nombre).map((t: any, i) => (
                    <tr
                      key={t.id ?? `${openLinea.nombre}-${i}`}
                      className="border-t"
                    >
                      <td className="p-2">{getChoferNombre(t)}</td>
                      <td className="p-2">{getDia(t) || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
