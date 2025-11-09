import { useEffect, useState } from "react";
import type { Chofer, UpdateChoferPayload } from "../../services/turnos/types";

type Props = {
  chofer?: Chofer | null;
  onClose: () => void;
  onSave: (
    choferId: number,
    payload: UpdateChoferPayload
  ) => Promise<{ success: boolean; error?: string }>;
};

export function UpdateChoferModal({ chofer, onClose, onSave }: Props) {
  const [form, setForm] = useState<UpdateChoferPayload>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (chofer) {
      setForm({ nombre: chofer.nombre, email: chofer.email, password: "" });
    }
  }, [chofer]);

  if (!chofer) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const payload: UpdateChoferPayload = {};
    if (form.nombre?.trim()) payload.nombre = form.nombre.trim();
    if (form.email?.trim()) payload.email = form.email.trim();
    if (form.password) payload.password = form.password;

    if (!Object.keys(payload).length) {
      setError("No hay cambios para guardar");
      return;
    }

    setSaving(true);
    setError(null);
    const result = await onSave(chofer.id, payload);
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
        <h3 className="mb-4 text-lg font-semibold">Editar chofer</h3>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Nombre</label>
            <input
              type="text"
              value={form.nombre ?? ""}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, nombre: e.target.value }))
              }
              className="mt-1 w-full rounded border px-3 py-2"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={form.email ?? ""}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, email: e.target.value }))
              }
              className="mt-1 w-full rounded border px-3 py-2"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">
              Contraseña (opcional)
            </label>
            <input
              type="password"
              value={form.password ?? ""}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, password: e.target.value }))
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
