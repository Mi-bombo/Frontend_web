import { useState } from "react";
import type { CreateChoferPayload } from "../../services/turnos/types";

type Props = {
  onSubmit: (
    payload: CreateChoferPayload
  ) => Promise<{ success: boolean; error?: string }>;
};

const initialForm: CreateChoferPayload = {
  nombre: "",
  email: "",
  password: "",
};

export function CreateChoferForm({ onSubmit }: Props) {
  const [form, setForm] = useState<CreateChoferPayload>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.nombre.trim() || !form.email.trim() || !form.password.trim()) {
      setError("Todos los campos son obligatorios");
      return;
    }

    setSubmitting(true);
    setError(null);
    const result = await onSubmit(form);
    if (!result.success && result.error) {
      setError(result.error);
    } else {
      setForm(initialForm);
    }
    setSubmitting(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-2 rounded-lg border border-gray-200 p-4 shadow-sm"
    >
      <h4 className="text-base font-semibold">Crear nuevo chofer</h4>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <input
        type="text"
        placeholder="Nombre"
        value={form.nombre}
        onChange={(e) => setForm((prev) => ({ ...prev, nombre: e.target.value }))}
        className="w-full rounded border px-3 py-2"
      />
      <input
        type="email"
        placeholder="Correo"
        value={form.email}
        onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
        className="w-full rounded border px-3 py-2"
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={form.password}
        onChange={(e) =>
          setForm((prev) => ({ ...prev, password: e.target.value }))
        }
        className="w-full rounded border px-3 py-2"
      />
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded bg-emerald-600 px-4 py-2 text-white disabled:opacity-50"
      >
        {submitting ? "Creando..." : "Crear chofer"}
      </button>
    </form>
  );
}
