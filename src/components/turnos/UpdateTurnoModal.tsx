import { useEffect, useState } from "react";
import type {
  TurnoAsignado,
  UpdateTurnoPayload,
} from "../../services/turnos/types";

type Props = {
  turno?: TurnoAsignado | null;
  onClose: () => void;
  onSave: (
    turnoId: number,
    payload: UpdateTurnoPayload
  ) => Promise<{ success: boolean; error?: string }>;
};

export function UpdateTurnoModal({ turno, onClose, onSave }: Props) {
  const [form, setForm] = useState<UpdateTurnoPayload>({
    id_turno: 0,
    dia: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (turno) {
      setForm({
        id_turno: turno.id_turno,
        dia: turno.dia,
      });
    }
  }, [turno]);

  if (!turno) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.id_turno || !form.dia.trim()) {
      setError("Completa todos los campos");
      return;
    }
    setSaving(true);
    setError(null);
    const result = await onSave(turno.id, form);
    if (!result.success && result.error) {
      setError(result.error);
    } else {
      onClose();
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h3 className="mb-4 text-lg font-semibold">Actualizar turno</h3>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">
              ID de turno
            </label>
            <input
              type="number"
              value={form.id_turno}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  id_turno: Number(e.target.value),
                }))
              }
              className="mt-1 w-full rounded border px-3 py-2"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Día</label>
            <input
              type="text"
              value={form.dia}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  dia: e.target.value,
                }))
              }
              placeholder="YYYY-MM-DD"
              className="mt-1 w-full rounded border px-3 py-2"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded border px-4 py-2"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
