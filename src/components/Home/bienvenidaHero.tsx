import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { authenticated } from "../../context/AppContext";

export const BienvenidaHero: React.FC = () => {
  const ctx: any = authenticated?.();
  const session = ctx?.user;
  const token = session?.token ?? ctx?.token ?? localStorage.getItem("token");
  const rawUser = session?.user ?? session?.User ?? null;
  const rol = rawUser?.rol_id ?? rawUser?.role;
  const isSupervisor = rol === 1 || rol === "supervisor";
  const isLoggedIn = !!token && !!rawUser;

  const navigate = useNavigate();

  const goPanel = () => {
    navigate(isSupervisor ? "/supervisor" : "/dashboard", { replace: true });
  };

  const handleLogout = async () => {
    try {
      const api = (import.meta as any).env?.VITE_API_URL?.replace(/\/$/, "");
      if (api) {
        await fetch(`${api}/auth/logout`, {
          method: "POST",
          credentials: "include",
        }).catch(() => {});
      }
    } finally {
      try { localStorage.removeItem("token"); } catch {}
      try { localStorage.removeItem("user"); } catch {}
      if (typeof ctx?.logoutUser === "function") {
        await ctx.logoutUser();
      }
      navigate("/login", { replace: true });
    }
  };

  return (
    <section className="flex flex-col items-center py-20">
      <img
        src="/logo-colectivo.png"
        alt="Logo Transporte Formosa"
        className="w-32 mb-8"
      />
      <h1 className="mb-4 font-serif text-5xl font-bold text-gray-900 drop-shadow-md">
        Bienvenido al Sistema de Transporte Público de Formosa
      </h1>
      <p className="max-w-xl mb-8 text-lg text-center text-gray-600">
        Innovación y eficiencia para el transporte urbano. Gestiona rutas,
        monitorea el estado de la ciudad y conecta conductores y supervisores en tiempo real.
      </p>

      {!isLoggedIn ? (
        <div className="flex gap-4">
          <Link
            to="/login"
            className="px-6 py-3 font-semibold text-white transition bg-blue-600 rounded shadow hover:bg-blue-700"
          >
            Iniciar sesión
          </Link>
          <Link
            to="/about"
            className="px-6 py-3 font-semibold text-blue-700 transition bg-gray-100 rounded shadow hover:bg-blue-200"
          >
            Conoce más
          </Link>
        </div>
      ) : (
        <div className="flex gap-4">
          <button
            onClick={goPanel}
            className="px-6 py-3 font-semibold text-white transition bg-green-600 rounded shadow hover:bg-green-700"
          >
            Ir al panel
          </button>
          <button
            onClick={handleLogout}
            className="px-6 py-3 font-semibold text-gray-800 transition bg-gray-100 rounded shadow hover:bg-gray-200"
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </section>
  );
};
