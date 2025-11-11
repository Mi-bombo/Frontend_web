import { useEffect } from "react";

type Props = {
  message?: string | null;
  durationMs?: number;
  onClose?: () => void;
};

export function ResponseMessage({ message, durationMs = 3000, onClose }: Props) {
  useEffect(() => {
    if (!message || !onClose) return;
    const id = setTimeout(onClose, durationMs);
    return () => clearTimeout(id);
  }, [message, durationMs, onClose]);

  if (!message) return null;
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-2 mt-2 text-sm text-blue-800 border border-blue-200 rounded bg-blue-50">
      <span>{message}</span>
      <button
        type="button"
        onClick={onClose}
        className="p-1 text-blue-700 rounded cursor-pointer hover:bg-blue-100"
        aria-label="Cerrar"
        title="Cerrar"
      >
        ×
      </button>
    </div>
  );
}
