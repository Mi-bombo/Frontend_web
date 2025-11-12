import { useEffect } from "react";
import Modal from "../Modal";
import { MapVisualizer } from "../supervisor/MapVisualizer";
import { useRutasService } from "../../services/supervisor/rutasService";

type Props = {
  isOpen: boolean;
  lineaId: number | null;
  onClose: () => void;
};

export default function RutaModal({ isOpen, lineaId, onClose }: Props) {
  const { ruta, loading, obtenerRutaPorId } = useRutasService();

  useEffect(() => {
    if (isOpen && lineaId != null) {
      obtenerRutaPorId(lineaId).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, lineaId]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={ruta?.nombre ? `Ruta: ${ruta.nombre}` : "Ver ruta"} size="lg">
      {loading && <p className="text-sm text-slate-500">Cargando ruta...</p>}
      {!loading && ruta && (
        <div>
          <p className="text-sm text-slate-600 mb-2">{ruta.descripcion}</p>
          <MapVisualizer trayecto={(ruta.trayecto && ruta.trayecto.coordinates) || []} paradas={ruta.paradas || []} editable={false} />
        </div>
      )}
      {!loading && !ruta && <p className="text-sm text-slate-500">No se encontró la ruta seleccionada.</p>}
    </Modal>
  );
}
