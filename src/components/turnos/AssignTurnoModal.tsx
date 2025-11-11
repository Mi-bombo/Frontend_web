// src/components/turnos/AssignTurnoModal.tsx
import { useEffect, useState } from "react";
import type { AssignTurnoPayload, Chofer, TurnoCatalogo } from "../../services/turnos/types";

type Props = {
  chofer?: Chofer | null;
  onClose: () => void;
  onAssign: (choferId: number, payload: AssignTurnoPayload) => Promise<{ success: boolean; error?: string }>;
  catalogoTurnos?: TurnoCatalogo[];
  loadingCatalogo?: boolean;
};

export function AssignTurnoModal({
  chofer,
  onClose,
  onAssign,
  catalogoTurnos = [],
  loadingCatalogo = false,
}: Props) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [idTurno, setIdTurno] = useState<string>("");
  const [fecha, setFecha] = useState<string>("");

  useEffect(() => {
    if (chofer) {
      setIdTurno("");
      setFecha(new Date().toISOString().slice(0, 10));
      setError(null);
      setSaving(false);
    }
  }, [chofer]);

  if (!chofer) return null;

  const closeOnBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const isISO = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);
  const disabledSelect = loadingCatalogo || catalogoTurnos.length === 0;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (catalogoTurnos.length === 0) return setError("No hay turnos disponibles para asignar.");
    const idNum = Number(idTurno);
    if (!idNum) return setError("Seleccioná un turno");
    if (!isISO(fecha)) return setError("Seleccioná una fecha válida (AAAA-MM-DD)");

    setSaving(true);
    setError(null);
    const result = await onAssign(chofer.id, { id_turno: idNum, fecha });
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

        <h3 className="mb-2 text-lg font-semibold">Asignar turno a {chofer.nombre}</h3>
        {error && <p className="text-sm text-red-600">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Turno</label>
            <select
              value={idTurno}
              onChange={(e) => setIdTurno(e.target.value)}
              disabled={disabledSelect}
              className="w-full px-3 py-2 mt-1 border rounded outline-none cursor-pointer focus:border-blue-300 focus:ring-2 focus:ring-blue-200 disabled:cursor-default disabled:opacity-60"
            >
              {catalogoTurnos.length === 0 ? (
                <option value="">No hay turnos disponibles</option>
              ) : (
                <>
                  <option value="" disabled>Selecciona un turno</option>
                  {catalogoTurnos.map(t => (
                    <option key={t.id} value={t.id}>{t.nombre}</option>
                  ))}
                </>
              )}
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
              disabled={saving || disabledSelect}
              className="px-4 py-2 text-white bg-indigo-600 rounded cursor-pointer hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-default"
            >
              {saving ? "Asignando..." : "Asignar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
