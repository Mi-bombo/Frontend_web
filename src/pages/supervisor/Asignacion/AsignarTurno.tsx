
import { useEffect, useMemo, useState } from "react";
import { useSupervisorData } from "../../../view/supervisor/SupervisorDataProvider";
import { useRutasService } from "../../../services/supervisor/rutasService";
import { supervisorService } from "../../../services/turnos/supervisor.service";

export default function AsignarTurno() {
  const { choferes, loadingChoferes, refresh, refreshChoferes, token, isSupervisor } = useSupervisorData();
  const { rutas, obtenerRutas, loading: loadingRutas } = useRutasService();

  const [selectedChoferId, setSelectedChoferId] = useState<number | null>(null);
  const [selectedLineas, setSelectedLineas] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void obtenerRutas();
  }, []);

  const choferList = useMemo(() => choferes ?? [], [choferes]);

  const toggleLinea = (id: number) => {
    setSelectedLineas((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Cargar líneas asignadas cuando se selecciona un chofer
  useEffect(() => {
    let mounted = true;
    if (!selectedChoferId) {
      setSelectedLineas(new Set());
      return;
    }

    (async () => {
      try {
        const res = await supervisorService.getLineasByChofer(selectedChoferId, token);
        if (!mounted) return;
        if (res.success) {
          const ids = new Set<number>((res.data || []).map((l: any) => Number(l.id)));
          setSelectedLineas(ids);
        } else {
          setSelectedLineas(new Set());
          setMessage(res.error ?? "No se pudieron obtener líneas asignadas");
        }
      } catch (e) {
        if (!mounted) return;
        setSelectedLineas(new Set());
        setMessage((e as any)?.message ?? "Error al cargar asignaciones");
      }
    })();

    return () => { mounted = false; };
  }, [selectedChoferId, token]);

  const handleAsignar = async () => {
    if (!selectedChoferId) return setMessage("Seleccione un chofer primero.");
    if (selectedLineas.size === 0) return setMessage("Seleccione al menos una línea.");
    setLoading(true);
    setMessage(null);
    try {
      const res = await supervisorService.assignLineas(selectedChoferId, { lineas: Array.from(selectedLineas) }, token);
      if (res.success) {
        setMessage("Líneas asignadas correctamente.");
        // refrescar choferes/turnos si existe
        try { await refreshChoferes?.(); } catch {}
        try { await refresh?.(); } catch {}
        setSelectedLineas(new Set());
      } else {
        setMessage(res.error ?? "No se pudo asignar las líneas");
      }
    } catch (e) {
      setMessage((e as any)?.message ?? "Error inesperado");
    }
    setLoading(false);
  };



  if (!isSupervisor) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold">No autorizado</h2>
        <p className="text-sm text-slate-600">Necesitas rol de supervisor/administrador para ver esta pantalla.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Asignar líneas a choferes</h1>
          <p className="text-sm text-slate-500">Selecciona un chofer y marca las líneas que deseas asignarle.</p>
        </div>
      </div>

      {message && (
        <div className="p-3 text-sm text-white bg-blue-600 rounded">{message}</div>
      )}

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-5">
          <div className="overflow-hidden bg-white rounded-lg shadow">
            <div className="p-3 border-b">
              <strong>Choferes</strong>
            </div>
            <div className="max-h-96 overflow-auto">
              {loadingChoferes ? (
                <div className="p-4 text-sm text-slate-500">Cargando choferes…</div>
              ) : choferList.length === 0 ? (
                <div className="p-4 text-sm text-slate-500">No hay choferes.</div>
              ) : (
                <ul>
                  {choferList.map((c: any) => (
                    <li key={c.id} className={`flex items-center justify-between p-3 border-b hover:bg-slate-50 ${selectedChoferId === c.id ? 'bg-slate-50' : ''}`}>
                      <div>
                        <div className="font-semibold">{c.nombre}</div>
                        <div className="text-xs text-slate-500">{c.email}</div>
                      </div>
                      <div>
                        <button
                          onClick={() => setSelectedChoferId(c.id)}
                          className={`px-3 py-1 text-sm rounded-full border ${selectedChoferId === c.id ? 'bg-blue-600 text-white' : 'hover:bg-slate-50'}`}
                        >
                          {selectedChoferId === c.id ? 'Seleccionado' : 'Seleccionar'}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="col-span-7">
          <div className="overflow-hidden bg-white rounded-lg shadow">
            <div className="p-3 border-b flex items-center justify-between">
              <strong>Listado de líneas</strong>
              <div className="text-xs text-slate-500">{loadingRutas ? 'Cargando…' : `${rutas?.length ?? 0} líneas`}</div>
            </div>

            <div className="max-h-96 overflow-auto">
              {loadingRutas ? (
                <div className="p-4 text-sm text-slate-500">Cargando líneas…</div>
              ) : rutas?.length === 0 ? (
                <div className="p-4 text-sm text-slate-500">No hay líneas registradas.</div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="p-2 text-left">Asignar</th>
                      <th className="p-2 text-left">Nombre</th>
                      <th className="p-2 text-left">Descripción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rutas.map((r: any) => (
                      <tr key={r.id} className="border-t hover:bg-slate-50">
                        <td className="p-2">
                          <input
                            type="checkbox"
                            checked={selectedLineas.has(r.id)}
                            onChange={() => toggleLinea(r.id)}
                          />
                        </td>
                        <td className="p-2">{r.nombre}</td>
                        <td className="p-2 text-slate-500">{r.descripcion ?? '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="p-3 border-t flex items-center justify-end gap-2">
              <button
                onClick={() => { setSelectedLineas(new Set()); setSelectedChoferId(null); setMessage(null); }}
                className="px-4 py-2 rounded-md border hover:bg-slate-50"
              >
                Limpiar
              </button>
              <button
                onClick={handleAsignar}
                disabled={loading || !selectedChoferId || selectedLineas.size === 0}
                className="px-4 py-2 font-semibold text-white bg-blue-600 rounded-md disabled:opacity-50"
              >
                {loading ? 'Asignando…' : 'Asignar líneas'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
