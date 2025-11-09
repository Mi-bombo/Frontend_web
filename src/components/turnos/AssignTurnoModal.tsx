import { useEffect, useState } from "react";
import type { AssignTurnoPayload, Chofer } from "../../services/turnos/types";

type Props = {
  chofer?: Chofer | null;
  onClose: () => void;
  onAssign: (
    choferId: number,
    payload: AssignTurnoPayload
  ) => Promise<{ success: boolean; error?: string }>;
};

const initialState: AssignTurnoPayload = {
  id_turno: 0,
  dia: "",
};

export function AssignTurnoModal({ chofer, onClose, onAssign }: Props) {
  const [form, setForm] = useState<AssignTurnoPayload>(initialState);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (chofer) {
      setForm(initialState);
    }
  }, [chofer]);

  if (!chofer) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.id_turno || !form.dia.trim()) {
      setError("Completa todos los campos");
      return;
    }
    setSaving(true);
    setError(null);
    const result = await onAssign(chofer.id, form);
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
        <h3 className="mb-2 text-lg font-semibold">
          Asignar turno a {chofer.nombre}
        </h3>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">
              ID del turno
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
              placeholder="YYYY-MM-DD"
              value={form.dia}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, dia: e.target.value }))
              }
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
              className="rounded bg-indigo-600 px-4 py-2 text-white disabled:opacity-50"
            >
              {saving ? "Asignando..." : "Asignar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
