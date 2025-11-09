import { Navigate, Outlet, useLocation } from "react-router-dom";
import { authenticated } from "../context/AppContext";

const mapRole = (user: any) => {
  if (!user) return undefined;
  if (user.role) return user.role;
  if (typeof user.rol_id === "number") {
    if (user.rol_id === 1) return "supervisor";
    if (user.rol_id === 2) return "chofer";
  }
  return undefined;
};

export default function PrivateRouter() {
  const ctx = authenticated();
  const session = (ctx as any)?.user;
  const loading = (ctx as any)?.loading;
  const location = useLocation();

  if (loading) return null;

  const user = session?.User ?? session?.user ?? null;
  const isAuthenticated = Boolean(session?.token || user);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const role = mapRole(user) ?? "default";

  if (role !== "supervisor" && location.pathname.startsWith("/supervisor")) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
