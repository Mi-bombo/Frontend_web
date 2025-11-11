import { useMemo } from "react";
import type { ObstruccionAlerta, TurnoChofer } from "../../services/turnos/types";

type Props = {
  turnos: TurnoChofer[];
  loading?: boolean;
  alerts?: ObstruccionAlerta[];
  onDismissAlert?: (id: number) => void;
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

export function ChoferPanel({ turnos, loading, alerts = [], onDismissAlert }: Props) {
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

      {alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alerta) => (
            <article
              key={alerta.obstruccionId}
              className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                    Desvío obligatorio
                  </p>
                  <h3 className="text-base font-semibold text-amber-900">
                    {alerta.titulo}
                  </h3>
                </div>
                {onDismissAlert && (
                  <button
                    type="button"
                    className="text-xs font-semibold text-amber-700 hover:underline"
                    onClick={() => onDismissAlert(alerta.obstruccionId)}
                  >
                    Cerrar
                  </button>
                )}
              </div>
              <p className="mt-2 text-sm">
                {alerta.mensaje}
              </p>
              {alerta.lineas.length > 0 && (
                <ul className="mt-3 space-y-1 text-xs text-amber-800">
                  {alerta.lineas.map((linea) => (
                    <li key={linea.lineaId} className="flex items-center justify-between">
                      <span>{linea.lineaNombre}</span>
                      <span className="font-semibold">
                        {Math.round(linea.porcentajeTramoAfectado * 100)}% afectado
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-2 text-[11px] text-amber-600">
                Recibido: {new Date(alerta.recibidaEn).toLocaleString()}
              </p>
            </article>
          ))}
        </div>
      )}

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
        <h3 className="mb-2 text-lg font-semibold">Mis turnos</h3>

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
    </section>
  );
}
