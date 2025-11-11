import { type FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ModalHeader from "../../../components/supervisor/ModalHeader";
import { EditorTrayectoCallesYParadas } from "../../../components/supervisor/EditorTrayectoParadas";
import type { TrayectoMulti } from "../../../services/supervisor/rutasService";

type SubmitStatus = { type: "success" | "error"; message: string };

type LineaImpacto = {
  lineaId: number;
  lineaNombre: string;
  porcentajeTramoAfectado: number;
};

const SUPERVISOR_API =
  import.meta.env.VITE_SUPERVISOR_API ?? "http://127.0.0.1:4000/supervisor";

export default function CrudObstruccion() {
  const navigate = useNavigate();

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [geojsonCalles, setGeojsonCalles] = useState<any | null>(null);
  const [sectorSeleccionado, setSectorSeleccionado] = useState<TrayectoMulti>([]);
  const [enviando, setEnviando] = useState(false);
  const [status, setStatus] = useState<SubmitStatus | null>(null);
  const [impacto, setImpacto] = useState<LineaImpacto[]>([]);

  useEffect(() => {
    fetch("/calles_formosa.geojson")
      .then((resp) => resp.json())
      .then(setGeojsonCalles)
      .catch(() =>
        setStatus({
          type: "error",
          message: "No se pudo cargar el mapa de calles. Intenta recargar.",
        })
      );
  }, []);

  const isFormValid =
    titulo.trim().length > 3 &&
    descripcion.trim().length > 5 &&
    sectorSeleccionado.length > 0 &&
    !enviando;

  const handleSubmit = async (evt: FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    if (sectorSeleccionado.length === 0) {
      setStatus({ type: "error", message: "Marcá en el mapa el tramo obstruido." });
      return;
    }

    const payload = {
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      tramo: sectorSeleccionado,
    };

    try {
      setEnviando(true);
      setStatus(null);
      setImpacto([]);

      const response = await fetch(`${SUPERVISOR_API}/obstrucciones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(body?.error || "No se pudo registrar la obstrucción.");
      }

      setImpacto(body?.lineasAfectadas ?? []);
      setStatus({
        type: "success",
        message: body?.message || "Obstrucción registrada correctamente.",
      });
      setTitulo("");
      setDescripcion("");
      setSectorSeleccionado([]);
    } catch (error) {
      console.error("[CrudObstruccion] submit error:", error);
      setStatus({
        type: "error",
        message:
          (error as Error)?.message ||
          "Ocurrió un error al guardar la obstrucción. Intenta nuevamente.",
      });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <ModalHeader
        nombreSistema="Registrar obstrucción"
        onBack={() => navigate("/supervisor/obstrucciones")}
      />

      <div className="mx-auto max-w-6xl px-6 pb-16">
        <div className="grid gap-8 lg:grid-cols-2">
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100"
          >
            <div className="mb-8 space-y-6">
              <header>
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Nueva obstrucción
                </p>
                <h1 className="text-2xl font-bold text-slate-900">Detalle</h1>
                <p className="text-sm text-slate-500">
                  Solo necesitás describir la incidencia y marcar el tramo. El sistema
                  detectará automáticamente qué líneas fueron afectadas.
                </p>
              </header>

              <label className="block text-sm font-medium text-slate-700">
                Título
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ej: Obstáculo en Av. 9 de Julio"
                />
              </label>

              <label className="block text-sm font-medium text-slate-700">
                Descripción
                <textarea
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  rows={5}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Agregar información útil para los choferes, horario estimado, desvíos sugeridos, etc."
                />
              </label>

              <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-sm text-slate-600">
                <p className="font-semibold text-slate-800">Resumen de selección</p>
                <p>
                  {sectorSeleccionado.length === 0
                    ? "Aún no marcaste el tramo afectado."
                    : `Marcaste ${sectorSeleccionado.length} segmento${
                        sectorSeleccionado.length > 1 ? "s" : ""
                      } de la red vial.`}
                </p>
              </div>
            </div>

            {status && (
              <div
                className={`mb-6 rounded-xl px-4 py-3 text-sm ${
                  status.type === "success"
                    ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                    : "bg-red-50 text-red-700 ring-1 ring-red-200"
                }`}
              >
                {status.message}
              </div>
            )}

            {impacto.length > 0 && (
              <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50/60 p-4 text-sm text-blue-900">
                <p className="font-semibold mb-2">
                  Líneas afectadas detectadas automáticamente:
                </p>
                <ul className="space-y-1">
                  {impacto.map((linea) => (
                    <li key={linea.lineaId} className="flex items-center justify-between">
                      <span>{linea.lineaNombre}</span>
                      <span className="text-xs font-semibold text-blue-700">
                        {Math.round(linea.porcentajeTramoAfectado * 100)}% del recorrido
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2 text-slate-600 transition hover:bg-slate-50"
                onClick={() => {
                  setTitulo("");
                  setDescripcion("");
                  setSectorSeleccionado([]);
                  setImpacto([]);
                }}
              >
                Limpiar formulario
              </button>
              <button
                type="submit"
                disabled={!isFormValid}
                className={`flex-1 rounded-xl px-4 py-2 font-semibold text-white transition ${
                  isFormValid
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-blue-200 cursor-not-allowed"
                }`}
              >
                {enviando ? "Guardando..." : "Registrar obstrucción"}
              </button>
            </div>
          </form>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <div className="mb-4">
              <p className="text-sm uppercase text-slate-500">Mapa interactivo</p>
              <h2 className="text-lg font-semibold text-slate-900">
                Marcá el sector obstruido
              </h2>
              <p className="text-sm text-slate-500">
                Hacé clic en los tramos afectados. Podés seleccionar múltiples segmentos
                contiguos y el sistema notificará a las líneas impactadas.
              </p>
            </div>

            {geojsonCalles ? (
              <EditorTrayectoCallesYParadas
                keyLinea="obstruccion"
                geojsonCalles={geojsonCalles}
                trayectoInicial={sectorSeleccionado}
                paradasInicial={[]}
                modo="trayecto"
                onChange={(trayectoNuevo) => {
                  setSectorSeleccionado(trayectoNuevo);
                }}
              />
            ) : (
              <div className="flex h-80 items-center justify-center rounded-2xl border border-dashed border-slate-200 text-slate-400">
                Cargando mapa de calles…
              </div>
            )}

            <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
              <span>
                {sectorSeleccionado.length === 0
                  ? "Sin tramos seleccionados."
                  : `${sectorSeleccionado.length} tramo${
                      sectorSeleccionado.length > 1 ? "s" : ""
                    } seleccionados.`}
              </span>
              <button
                type="button"
                className="text-sm font-semibold text-blue-600 hover:underline disabled:text-slate-400"
                onClick={() => setSectorSeleccionado([])}
                disabled={sectorSeleccionado.length === 0}
              >
                Limpiar selección
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
