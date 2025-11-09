import { Link } from "react-router-dom";

export default function SidebarSupervisor() {
  return (
    <aside className="h-screen w-64 bg-gray-900 text-white flex flex-col p-4">
      <h2 className="text-2xl font-bold mb-6">Panel supervisor</h2>
      <nav className="flex flex-col space-y-2">
        <Link to="/supervisor" className="hover:bg-gray-700 p-2 rounded">
          Dashboard
        </Link>
        <Link
          to="/supervisor/usuarios"
          className="hover:bg-gray-700 p-2 rounded"
        >
          Usuarios
        </Link>
        <Link to="/supervisor/lineas" className="hover:bg-gray-700 p-2 rounded">
          Líneas
        </Link>
        <Link to="/supervisor/rutas" className="hover:bg-gray-700 p-2 rounded">
          Rutas
        </Link>
        <Link to="/supervisor/turnos" className="hover:bg-gray-700 p-2 rounded">
          Turnos
        </Link>
        <Link
          to="/supervisor/obstrucciones"
          className="hover:bg-gray-700 p-2 rounded"
        >
          Obstrucciones
        </Link>
      </nav>
    </aside>
  );
}
