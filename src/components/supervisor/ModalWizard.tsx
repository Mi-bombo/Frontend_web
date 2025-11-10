import { useState } from "react";
import { MapaTrayecto } from "./MapaTrayecto";
import { useRutasService } from "../../services/supervisor/rutasService";
import type { TrayectoMulti, Parada } from "./MapaTrayecto";
import type { Point } from "ol/geom";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ModalWizardLinea({ open, onClose }: Props) {
  const [paso, setPaso] = useState(1);
  const [nombreLinea, setNombreLinea] = useState("");
  const [descripcionLinea, setDescripcionLinea] = useState("");
  const [trayecto, setTrayecto] = useState<TrayectoMulti>([]);
  const [paradas, setParadas] = useState<Parada[]>([]);
  const [descripcionRuta, setDescripcionRuta] = useState<"ida" | "vuelta">("ida");
  const [localLoading, setLocalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { crearLineaYRuta } = useRutasService();

  if (!open) return null;

  function serializeParadas(paradas: Parada[]) {
    return paradas.map(f => ({
      coords: ((f.getGeometry() as Point).getCoordinates() as number[]).slice(0, 2) as [number, number],
    }));
  }

  function nombreRutaPorLinea(linea?: { numero?: string; nombre?: string }) {
    if (!linea || !linea.nombre) {
      throw new Error("La línea o su nombre están indefinidos");
    }
    return linea.numero
      ? `Ruta de línea ${linea.numero}`
      : `Ruta de línea ${linea.nombre}`;
  }

  const handleSubmit = async () => {
    setLocalLoading(true);
    setError(null);
    const res = await crearLineaYRuta({
      linea: {
        nombre: nombreLinea,
        descripcion: `${descripcionLinea}`,
      },
      ruta: {
        nombre: nombreRutaPorLinea({ nombre: nombreLinea }),
        descripcion: `${descripcionRuta}`,
        trayecto,
        paradas: serializeParadas(paradas),
      },
    });
    setLocalLoading(false);
    if (res.success) {
      alert("¡Línea guardada correctamente!");
      setPaso(1); setNombreLinea(""); setDescripcionLinea(""); setTrayecto([]); setParadas([]);
      setDescripcionRuta("ida");
      onClose();
    } else {
      setError(res.error || "Error al guardar línea. Intenta de nuevo.");
    }
  };

  return (
    <div className="fixed z-50 inset-0 flex items-center justify-center bg-blue-100/50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full px-0 py-0 animate-fadein border-2 border-blue-100">
        <header className="flex items-center gap-3 px-8 pt-8 pb-2 bg-gradient-to-r from-blue-100 via-white to-blue-100 rounded-t-2xl border-b border-blue-200">
          <span className="text-3xl">🚌</span>
          <h2 className="text-xl font-bold text-blue-800 tracking-wide">Registrar Línea de Colectivo</h2>
        </header>
        <div className="flex items-center justify-around px-6 mt-5 mb-2">
          <WizardStep number={1} active={paso === 1} label="Nombre" />
          <div className="w-8 h-1 bg-blue-100 rounded-full mx-1" />
          <WizardStep number={2} active={paso === 2} label="Ruta" />
          <div className="w-8 h-1 bg-blue-100 rounded-full mx-1" />
          <WizardStep number={3} active={paso === 3} label="Paradas" />
        </div>
        <div className="p-8 pb-4">
          {error && <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4">{error}</div>}
          {paso === 1 && (
            <div>
              <label className="block mb-3 font-semibold text-blue-700">
                Nombre de la línea
                <input
                  className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-300 mt-2 text-blue-900"
                  value={nombreLinea}
                  onChange={(e) => setNombreLinea(e.target.value)}
                  placeholder="Ejemplo: Línea 32 Centro"
                />
              </label>
              <label className="block mb-1 font-semibold text-blue-700 mt-6">
                Descripción / Alcance
                <textarea
                  className="w-full px-4 py-3 border-2 border-yellow-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-300 mt-2 text-blue-900"
                  value={descripcionLinea}
                  onChange={e => setDescripcionLinea(e.target.value)}
                  placeholder="Ejemplo: de barrio Luján - hasta barrio Obrero"
                  rows={3}
                />
              </label>
            </div>
          )}
          {paso === 2 && (
            <div>
              <div className="mb-5 flex items-center">
                <label className="font-bold text-blue-700 mr-3">Sentido de la ruta:</label>
                <select
                  className="border-2 border-blue-300 rounded px-2 py-1 bg-blue-50 text-blue-700 font-bold"
                  value={descripcionRuta}
                  onChange={e => setDescripcionRuta(e.target.value as "ida" | "vuelta")}
                >
                  <option value="ida">Ida</option>
                  <option value="vuelta">Vuelta</option>
                </select>
              </div>
              <MapaTrayecto
                paso={2}
                onChange={(trayecto) => setTrayecto(trayecto)}
              />
            </div>
          )}
          {paso === 3 && (
            <MapaTrayecto
              paso={3}
              trayecto={trayecto}
              onChange={(_, stops) => setParadas(stops ?? [])}
            />
          )}
          <div className="flex justify-end gap-3 mt-8">
            <button
              className="bg-white px-6 py-2 rounded shadow-sm border-2 border-yellow-300 text-yellow-700 hover:bg-yellow-50 font-semibold"
              onClick={onClose}
              disabled={localLoading}
            >
              Cancelar
            </button>
            {paso > 1 && (
              <button
                className="bg-white px-6 py-2 rounded shadow-sm border-2 border-blue-200 text-blue-700 hover:bg-blue-50 font-semibold"
                onClick={() => setPaso(paso - 1)}
                disabled={localLoading}
              >
                Anterior
              </button>
            )}
            {paso < 3 && (
              <button
                className={`px-6 py-2 rounded font-bold shadow ${paso === 2 && trayecto.length < 2 ? "bg-blue-200 border-2 border-blue-200 text-blue-400 cursor-not-allowed" : "bg-blue-700 border-2 border-blue-700 text-white hover:bg-blue-800"}`}
                onClick={() => setPaso(paso + 1)}
                disabled={localLoading || (paso === 2 && trayecto.length < 2)}
              >
                Siguiente
              </button>
            )}
            {paso === 3 && (
              <button
                className={`px-6 py-2 rounded font-bold shadow
                  ${paradas.length < 5
                    ? "bg-yellow-100 border-2 border-yellow-200 text-yellow-400 cursor-not-allowed"
                    : "bg-yellow-400 border-2 border-yellow-300 text-blue-900 hover:bg-yellow-300"}
                `}
                onClick={handleSubmit}
                disabled={localLoading || paradas.length < 5}
              >
                {localLoading ? "Guardando..." : "Guardar línea"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function WizardStep({ number, active, label }: { number: number; active: boolean; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className={
        "w-10 h-10 flex items-center justify-center rounded-full font-bold border-4 transition-all duration-200 " +
        (active
          ? "bg-yellow-300 border-yellow-400 text-blue-800 shadow-lg"
          : "bg-blue-50 border-blue-200 text-blue-400 shadow-sm")
      }>
        {number}
      </div>
      <span className={
        "mt-2 text-sm font-semibold transition-colors " +
        (active ? "text-blue-800" : "text-blue-400")
      }>
        {label}
      </span>
    </div>
  );
}
