// PublicRouter.tsx
import { Outlet, Navigate } from "react-router-dom";
import { authenticated } from "../context/AppContext";

export default function PublicRouter() {
  const ctx: any = authenticated?.();
  const session = ctx?.user;
  const token = session?.token ?? ctx?.token ?? localStorage.getItem("token");
  const rawUser = session?.user ?? session?.User ?? null;
  const isLoggedIn = !!token && !!rawUser;

  if (isLoggedIn) {
    const rol = rawUser?.rol_id ?? rawUser?.role;
    const isSupervisor = rol === 1 || rol === "supervisor";
    return <Navigate to={isSupervisor ? "/supervisor" : "/dashboard"} replace />;
  }
  return <Outlet />;
}
