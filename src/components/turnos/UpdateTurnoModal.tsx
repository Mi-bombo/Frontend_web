import { useEffect, useState } from "react";
import type { TurnoAsignado, UpdateTurnoPayload, TurnoCatalogo } from "../../services/turnos/types";

const toISODate = (v?: string | Date | null) => {
  if (!v) return "";
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  const m = v.match(/^\d{4}-\d{2}-\d{2}/);
  if (m) return m[0];
  return "";
};

type Props = {
  turno?: TurnoAsignado | null;
  onClose: () => void;
  onSave: (turnoId: number, payload: UpdateTurnoPayload) => Promise<{ success: boolean; error?: string }>;
  catalogoTurnos?: TurnoCatalogo[];
  loadingCatalogo?: boolean;
};

export function UpdateTurnoModal({
  turno,
  onClose,
  onSave,
  catalogoTurnos = [],
  loadingCatalogo = false,
}: Props) {
  const [idTurno, setIdTurno] = useState<string>("");
  const [fecha, setFecha] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (turno) {
      setIdTurno(String(turno.id_turno ?? ""));
      setFecha(toISODate((turno as any)?.fecha) || new Date().toISOString().slice(0, 10));
      setError(null);
      setSaving(false);
    } else {
      setIdTurno("");
      setFecha("");
    }
  }, [turno]);

  if (!turno) return null;

  const closeOnBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const isISO = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const idNum = Number(idTurno);
    if (!idNum) return setError("Seleccioná un turno");
    if (!isISO(fecha)) return setError("Seleccioná una fecha válida (AAAA-MM-DD)");

    setSaving(true);
    setError(null);
    const payload: UpdateTurnoPayload = { id_turno: idNum, fecha };
    const result = await onSave(turno.id, payload);
    if (!result.success && result.error) setError(result.error);
    else onClose();
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60" onClick={closeOnBackdrop}>
      <div className="relative w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
        <button
          type="button"
          onClick={onClose}
          className="absolute p-1 rounded cursor-pointer right-3 top-3 text-slate-500 hover:bg-slate-100"
          aria-label="Cerrar"
          title="Cerrar"
        >
          ×
        </button>

        <h3 className="mb-4 text-lg font-semibold">Actualizar turno</h3>
        {error && <p className="text-sm text-red-600">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Turno</label>
            <select
              value={idTurno}
              onChange={(e) => setIdTurno(e.target.value)}
              disabled={loadingCatalogo}
              className="w-full px-3 py-2 mt-1 border rounded outline-none cursor-pointer focus:border-blue-300 focus:ring-2 focus:ring-blue-200 disabled:cursor-default disabled:opacity-60"
            >
              <option value="" disabled>Selecciona un turno</option>
              {catalogoTurnos.map(t => (
                <option key={t.id} value={t.id}>{t.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Fecha</label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full px-3 py-2 mt-1 border rounded outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded cursor-pointer hover:bg-slate-50">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-white bg-blue-600 rounded cursor-pointer hover:bg-blue-700 disabled:opacity-50 disabled:cursor-default"
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
