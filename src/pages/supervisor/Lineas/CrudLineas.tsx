import { useEffect, useState } from "react";
import ModalWizardLinea from "../../../components/supervisor/ModalWizard";
import ModalWizardRuta from "../../../components/supervisor/ModalWizardRuta";
import { RutaCardMini } from "../../../components/supervisor/RutaCardMini";
import { useRutasService } from "../../../services/supervisor/rutasService";
import type { RutaFrontend } from "../../../services/supervisor/rutasService";
import ModalHeader from "../../../components/supervisor/ModalHeader";
import { useNavigate } from "react-router-dom";

export function CrudLineas() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalRutaOpen, setModalRutaOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [rutaSeleccionada, setRutaSeleccionada] = useState<RutaFrontend | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    rutas,
    loading,
    obtenerRutas,
    eliminarRuta,
    obtenerRutaPorId,
    setRutas
  } = useRutasService();

  const cargarLineas = async () => {
    const res = await obtenerRutas();
    if (!res.success) setErrorMsg(res.error || "Error al obtener líneas");
    else setErrorMsg(null);
  };

  useEffect(() => { cargarLineas(); }, []);

  // Eliminar línea
  const handleDelete = async (linea: any) => {
    if (!window.confirm(`¿Borrar la línea "${linea.nombre}"?`)) return;
    const res = await eliminarRuta(linea.id);
    if (res.success) cargarLineas();
    else alert(res.error || "No se pudo eliminar la línea");
  };

  // Abrir modal de detalles de ruta
  const handleViewRuta = async (linea: any) => {
    const res = await obtenerRutaPorId(linea.id);
    if (res.success && res.data) {
      setRutaSeleccionada(res.data);
      setModoEdicion(false);
      setModalRutaOpen(true);
    } else {
      alert(res.error || "No se pudo cargar la ruta");
    }
  };

  // Abrir modal edición de ruta
  const handleEdit = async (linea: any) => {
    const res = await obtenerRutaPorId(linea.id); // para traer datos frescos si editas
    if (res.success && res.data) {
      setRutaSeleccionada(res.data);
      setModoEdicion(true);
      setModalRutaOpen(true);
    } else {
      alert(res.error || "No se pudo cargar la ruta para editar");
    }
  };

  // Modal para crear nueva línea, se mantiene igual
  // ModalWizardLinea...
  const navigate = useNavigate();
  return (
    <div className=" mx-auto">
      <ModalHeader
        nombreSistema="Líneas de colectivo"
        onBack={() => navigate("/supervisor")}
      />
      <div className="flex justify-between items-center mb-7 pl-10 pr-10">
        <h1 className="text-3xl font-bold text-blue-700">Líneas de colectivo</h1>
        <button
          className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-500 font-semibold"
          onClick={() => setModalOpen(true)}
        >
          Nueva línea
        </button>
      </div>

      <ModalWizardLinea
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          cargarLineas();
        }}
      />

      <ModalWizardRuta
        open={modalRutaOpen}
        onClose={() => {
          setModalRutaOpen(false);
          setModoEdicion(false);
        }}
        ruta={rutaSeleccionada}
        modoEdicion={modoEdicion}
        // onGuardarRuta={...} // puedes agregar handler para guardar aquí
      />

      {loading && <div className="text-blue-700 mb-4">Cargando líneas...</div>}
      {errorMsg && <div className="text-red-600 bg-red-50 rounded px-4 py-2 mb-4">{errorMsg}</div>}

      <div className="flex flex-wrap gap-7 justify-start pl-10 pr-10">
        {Array.isArray(rutas) && rutas.length > 0 ? (
          rutas.map(linea => (
            <RutaCardMini
              key={linea.id}
              linea={linea}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onView={() => handleViewRuta(linea)} 
            />
          ))
        ) : (
          !loading &&
          <div className="text-blue-400 text-lg mx-auto mt-8 bg-blue-50 px-6 py-4 rounded-xl border border-blue-100 flex items-center gap-2">
            <span>🚌</span>
            <span>No hay líneas registradas.</span>
          </div>
        )}
      </div>
    </div>
  );
}
