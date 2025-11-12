import { useMemo, useState } from "react";
import RutaModal from "./RutaModal";
import type { TurnoChofer } from "../../services/turnos/types";

type Props = {
  turnos: TurnoChofer[];   
  loading?: boolean;
  onLogout: () => void;
  assignedLines?: Array<{ id: number; nombre: string }>;
};

const isISO = (s?: string) => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);
const parseISO = (s?: string | null) =>
  isISO(s || "") ? new Date(`${s}T00:00:00`) : null;

const startOfTodayMs = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
};

const dowEs = (d: Date) => ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"][d.getDay()];
const fmtFechaHumana = (s?: string, fallback?: string) => {
  const d = parseISO(s);
  if (!d) return fallback ?? (s || "—");
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${dowEs(d)} ${yyyy}-${mm}-${dd}`;
};

type TurnoUI = {
  id?: number;
  nombre: string;
  fecha?: string;
  diaFallback?: string;
  when?: number; // epoch ms
};

export function ChoferPanel({ turnos, loading, assignedLines }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLineaId, setSelectedLineaId] = useState<number | null>(null);

  const { lista, proximo } = useMemo(() => {
    const norm: TurnoUI[] = (turnos || []).map((t, i) => {
      const fecha = (t as any).fecha as string | undefined;
      const dia = (t as any).dia as string | undefined;
      const d = parseISO(fecha);
      return {
        id: (t as any).id ?? i,
        nombre: t.nombre_turno,
        fecha,
        diaFallback: !fecha ? dia : undefined,
        when: d ? d.getTime() : undefined,
      };
    });

    const sorted = [...norm].sort((a, b) => {
      const A = a.when ?? Number.POSITIVE_INFINITY;
      const B = b.when ?? Number.POSITIVE_INFINITY;
      return A - B;
    });

    const today = startOfTodayMs();
    const prox = sorted.find((x) => typeof x.when === "number" && x.when >= today);

    return { lista: sorted, proximo: prox };
  }, [turnos]);

  return (
    <section className="p-6 space-y-5 bg-white border border-gray-200 rounded-lg shadow-sm">
      <header className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Panel del Chofer</h2>
      </header>

      {loading ? (
        <div className="p-4 border rounded-lg animate-pulse">
          <div className="w-1/4 h-4 rounded bg-slate-200" />
          <div className="w-1/2 h-8 mt-3 rounded bg-slate-200" />
        </div>
      ) : proximo ? (
        <div className="p-4 border border-blue-200 rounded-xl bg-blue-50">
          <p className="text-sm font-medium text-blue-700">Próximo turno</p>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className="text-lg font-semibold text-blue-900">
              {proximo.nombre}
            </span>
            <span className="rounded-full border border-blue-200 bg-white px-2.5 py-0.5 text-xs font-semibold text-blue-700">
              {proximo.fecha
                ? fmtFechaHumana(proximo.fecha)
                : proximo.diaFallback || "—"}
            </span>
          </div>
        </div>
      ) : (
        <div className="p-4 border rounded-lg border-slate-200 bg-slate-50">
          <p className="text-sm text-slate-600">
            No tenés turnos programados a partir de hoy.
          </p>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between">
          <h3 className="mb-2 text-lg font-semibold">Mis turnos</h3>
        </div>

        {/* Líneas asignadas (si existieran) */}
  {assignedLines && assignedLines.length > 0 && (
          <div className="p-3 mb-3 border rounded bg-slate-50">
            <p className="text-sm font-medium text-slate-700 mb-2">Líneas asignadas</p>
            <div className="flex flex-wrap gap-2">
              {assignedLines.map((l: any) => (
                <div key={l.id} className="flex items-center gap-2 px-3 py-1 text-sm bg-white border rounded">
                  <span className="font-semibold">{l.nombre}</span>
                  <button className="px-2 py-0.5 text-xs text-white bg-indigo-600 rounded" onClick={() => { setSelectedLineaId(l.id); setModalOpen(true); }}>Ver ruta</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <ul className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <li key={i} className="p-3 border rounded animate-pulse border-slate-100 bg-slate-50">
                <div className="w-1/3 h-4 rounded bg-slate-200" />
                <div className="w-1/4 h-3 mt-2 rounded bg-slate-200" />
              </li>
            ))}
          </ul>
        ) : lista.length ? (
          <ul className="space-y-2">
            {lista.map((t, idx) => (
              <li
                key={`${t.id ?? idx}-${t.fecha ?? t.diaFallback ?? "x"}`}
                className="p-3 border rounded border-slate-100 bg-slate-50"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate text-slate-800">
                      {t.nombre}
                    </p>
                    <p className="text-xs text-slate-600">
                      {t.fecha ? (
                        <>
                          Fecha:&nbsp;
                          <strong className="font-semibold">
                            {fmtFechaHumana(t.fecha)}
                          </strong>
                        </>
                      ) : t.diaFallback ? (
                        <>
                          Día:&nbsp;
                          <strong className="font-semibold">{t.diaFallback}</strong>
                        </>
                      ) : (
                        "—"
                      )}
                    </p>
                  </div>

                  {t.when && t.when === proximo?.when ? (
                    <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                      Próximo
                    </span>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-600">Esperando asignaciones…</p>
        )}
      </div>
      <RutaModal isOpen={modalOpen} lineaId={selectedLineaId} onClose={() => { setModalOpen(false); setSelectedLineaId(null); }} />
    </section>
  );
}
