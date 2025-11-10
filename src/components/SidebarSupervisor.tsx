import { NavLink, useNavigate } from "react-router-dom";
import { FiHome, FiUsers, FiMap, FiList, FiAlertTriangle, FiLogOut } from "react-icons/fi";
import { authenticated } from "../context/AppContext";

const linkBase =
  "flex items-center gap-3 px-3 py-2 rounded transition hover:bg-gray-800";
const active =
  "bg-gray-800 text-white";
const inactive = "text-gray-300";

export default function SidebarSupervisor() {
  const ctx: any = authenticated?.();
  const navigate = useNavigate();

  const doLogout = async () => {
    try {
      const api = (import.meta as any).env?.VITE_API_URL?.replace(/\/$/, "");
      if (api) {
        await fetch(`${api}/auth/logout`, { method: "POST", credentials: "include" }).catch(() => {});
      }
    } finally {
      try { localStorage.removeItem("token"); } catch {}
      try { localStorage.removeItem("user"); } catch {}
      if (typeof ctx?.logoutUser === "function") await ctx.logoutUser();
      navigate("/login", { replace: true });
    }
  };

  return (
    <aside className="flex flex-col w-64 h-screen p-4 text-white bg-gray-900">
      <h2 className="mb-6 text-2xl font-bold">Panel supervisor</h2>
      <nav className="flex flex-col flex-1 gap-1">
        <NavLink
          to="/supervisor"
          end
          className={({ isActive }) =>
            `${linkBase} ${isActive ? active : inactive}`
          }
        >
          <FiHome /> Dashboard
        </NavLink>

        <NavLink
          to="/supervisor/usuarios"
          className={({ isActive }) =>
            `${linkBase} ${isActive ? active : inactive}`
          }
        >
          <FiUsers /> Usuarios
        </NavLink>

        <NavLink
          to="/supervisor/lineas"
          className={({ isActive }) =>
            `${linkBase} ${isActive ? active : inactive}`
          }
        >
          <FiList /> Líneas
        </NavLink>

        <NavLink
          to="/supervisor/rutas"
          className={({ isActive }) =>
            `${linkBase} ${isActive ? active : inactive}`
          }
        >
          <FiMap /> Rutas
        </NavLink>

        <NavLink
          to="/supervisor/turnos"
          className={({ isActive }) =>
            `${linkBase} ${isActive ? active : inactive}`
          }
        >
          <FiList /> Turnos
        </NavLink>

        <NavLink
          to="/supervisor/obstrucciones"
          className={({ isActive }) =>
            `${linkBase} ${isActive ? active : inactive}`
          }
        >
          <FiAlertTriangle /> Obstrucciones
        </NavLink>
      </nav>

      <button
        onClick={doLogout}
        className="flex items-center gap-3 px-3 py-2 mt-4 text-sm font-semibold bg-gray-800 rounded hover:bg-gray-700"
      >
        <FiLogOut /> Cerrar sesión
      </button>
    </aside>
  );
}
