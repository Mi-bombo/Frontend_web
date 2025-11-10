import { useEffect, useState } from "react";
import { EditorTrayectoCallesYParadas } from "./EditorTrayectoParadas";
import { MapVisualizer } from "./MapVisualizer";
import type { RutaFrontend, ParadaCoords } from "../../services/supervisor/rutasService";

interface ModalWizardRutaProps {
  open: boolean;
  onClose: () => void;
  ruta: RutaFrontend | null;
  modoEdicion?: boolean;
  onGuardarRuta?: (nuevaRuta: RutaFrontend) => void;
}

export default function ModalWizardRuta({
  open,
  onClose,
  ruta,
  modoEdicion = false,
  onGuardarRuta,
}: ModalWizardRutaProps) {
  const [trayectoEdit, setTrayectoEdit] = useState<number[][][]>([]);
  const [paradasEdit, setParadasEdit] = useState<ParadaCoords[]>([]);
  const [editorModo, setEditorModo] = useState<"trayecto" | "paradas">("trayecto");
  const [geojsonCalles, setGeojsonCalles] = useState<any | null>(null);
  const [nombre, setNombre] = useState(ruta?.nombre ?? "");
  const [descripcion, setDescripcion] = useState(ruta?.descripcion ?? "");
  const [ready, setReady] = useState(false);

  // Carga GeoJSON de calles
  useEffect(() => {
    fetch("/calles_formosa.geojson")
      .then((resp) => resp.json())
      .then((data) => setGeojsonCalles(data));
  }, []);

  // Setea datos al cambiar la ruta
  useEffect(() => {
    setTrayectoEdit(
      Array.isArray(ruta?.trayecto)
        ? ruta.trayecto
        : (ruta?.trayecto?.coordinates ?? [])
    );
    setParadasEdit(ruta?.paradas ?? []);
    setNombre(ruta?.nombre ?? "");
    setDescripcion(ruta?.descripcion ?? "");
    setReady(false);
    // Delay un frame para asegurar que states se actualizaron antes de marcar ready
    setTimeout(() => setReady(true), 0);
  }, [ruta]);

  if (!open) return null;

  const handleGuardar = () => {
    if (!ruta) return;
    onGuardarRuta?.({
      ...ruta,
      nombre,
      descripcion,
      trayecto: { type: "MultiLineString", coordinates: trayectoEdit },
      paradas: paradasEdit,
    });
    onClose();
  };

  return (
    <div className="fixed z-50 inset-0 flex items-center justify-center bg-blue-100/50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full px-0 py-0 border-2 border-blue-100 flex flex-row relative">
        {/* Panel datos */}
        <div className="flex-1 px-10 py-8 flex flex-col justify-between min-w-[340px]">
          <header className="flex items-center gap-3 mb-8">
            <span className="text-3xl">🗺️</span>
            <h2 className="text-xl font-bold text-blue-800 tracking-wide">
              {modoEdicion ? "Editar datos de la Línea" : "Detalles de la Línea"}
            </h2>
          </header>
          <div>
            <div className="mb-6">
              <span className="block text-lg font-bold text-blue-700">Nombre:</span>
              {modoEdicion ? (
                <input
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  className="w-full px-2 py-1 border rounded mt-1"
                  autoFocus
                />
              ) : (
                <span className="text-blue-900">{ruta?.nombre || "Sin nombre"}</span>
              )}
            </div>
            <div className="mb-6">
              <span className="block font-bold text-blue-700">Descripción:</span>
              {modoEdicion ? (
                <textarea
                  value={descripcion}
                  onChange={e => setDescripcion(e.target.value)}
                  className="w-full px-2 py-1 border rounded mt-1"
                />
              ) : (
                <span className="text-blue-900">{ruta?.descripcion || "Sin descripción"}</span>
              )}
            </div>
          </div>
          <div className="mt-8 flex justify-end gap-3">
            {modoEdicion && (
              <button
                className="bg-blue-700 text-white px-4 py-2 rounded shadow font-semibold hover:bg-blue-800"
                onClick={handleGuardar}
              >
                Guardar cambios
              </button>
            )}
            <button
              className="bg-white px-6 py-2 rounded shadow-sm border-2 border-yellow-300 text-yellow-700 hover:bg-yellow-50 font-semibold"
              onClick={onClose}
              style={{ zIndex: 50, position: "relative" }}
            >
              {modoEdicion ? "Cancelar" : "Cerrar"}
            </button>
          </div>
        </div>
        {/* Panel mapa */}
        <div className="flex-1 flex items-center justify-center p-6 relative">
          <div className="w-full h-[380px] max-w-md relative">
            {!geojsonCalles ? (
              <div className="w-full h-full flex items-center justify-center text-blue-400">Cargando calles...</div>
            ) : (modoEdicion && ready) ? (
              <>
                <EditorTrayectoCallesYParadas
                  keyLinea={ruta?.id ?? ""}
                  geojsonCalles={geojsonCalles}
                  trayectoInicial={trayectoEdit}
                  paradasInicial={paradasEdit}
                  modo={editorModo}
                  onChange={(tray, paras) => {
                    setTrayectoEdit(tray);
                    setParadasEdit(paras);
                  }}
                />
                <button
                  className="absolute top-2 left-2 px-4 py-2 rounded-full bg-blue-50 text-blue-800 border border-blue-200 shadow-sm font-semibold hover:bg-blue-100 transition"
                  onClick={() => setEditorModo(editorModo === "trayecto" ? "paradas" : "trayecto")}
                  style={{ zIndex: 10 }}
                >
                  {editorModo === "trayecto" ? "Editar Paradas" : "Editar Trayecto"}
                </button>
              </>
            ) : (
              <MapVisualizer
                trayecto={
                  Array.isArray(ruta?.trayecto)
                    ? ruta.trayecto
                    : ruta?.trayecto?.coordinates ?? []
                }
                paradas={ruta?.paradas ?? []}
                editable={false}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
