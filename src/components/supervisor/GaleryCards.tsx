import { useEffect, useState } from "react";
import { RutaCardMini } from "./RutaCardMini";
import ModalWizardRuta from "./ModalWizardRuta";
import { useRutasService } from "../../services/supervisor/rutasService";
import type { RutaFrontend } from "../../services/supervisor/rutasService";

export default function LineasGallery() {
  const { rutas, setRutas, obtenerRutas, eliminarRuta } = useRutasService();
  const [modalOpen, setModalOpen] = useState(false);
  const [rutaEdit, setRutaEdit] = useState<RutaFrontend | null>(null);
  const [modoEdicion, setModoEdicion] = useState(false);

  useEffect(() => {
    obtenerRutas().then(res => {
      if (!res.success) console.error(res.error || "No se pudieron obtener líneas");
    });
  }, []);

  const handleEdit = (linea: RutaFrontend) => {
    setRutaEdit(linea);
    setModoEdicion(true);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setRutaEdit(null);
    setModoEdicion(false);
  };

  return (
    <div className="flex flex-col min-h-[400px] w-full items-center justify-start p-10">
      {/* ...error/loading omitir... */}
      <div className="flex flex-wrap gap-7 justify-start w-full">
        {Array.isArray(rutas) && rutas.length > 0 && rutas.map(linea => (
          <RutaCardMini
            key={linea.id}
            linea={linea}
            onEdit={handleEdit}
            onDelete={eliminarRuta}
            onView={handleEdit}
          />
        ))}
      </div>
      <ModalWizardRuta
        open={modalOpen}
        onClose={handleCloseModal}
        ruta={rutaEdit}
        modoEdicion={modoEdicion}
        onGuardarRuta={(nuevaRuta) => {
          setRutas(prev => prev.map(ruta => ruta.id === nuevaRuta.id ? nuevaRuta : ruta));
          handleCloseModal();
        }}
      />
    </div>
  );
}
