import { Navigate, Outlet, useLocation } from "react-router-dom";
import { authenticated } from "../context/AppContext";

const isLoggedIn = (session: any) => {
  if (!session) return false;
  if (session?.token) return true;
  if (session?.User || session?.user) return true;
  console.log(session);
  return false;
};

export default function PublicRouter() {
  const ctx = authenticated();
  const session = (ctx as any)?.user;
  const loading = (ctx as any)?.loading;
  const location = useLocation();

  if (loading) return null;

  const normalizePath = (path: string) => {
    if (!path) return "/";
    const trimmed = path.trim().toLowerCase();
    if (trimmed === "/") return trimmed;
    return trimmed.endsWith("/") ? trimmed.slice(0, -1) : trimmed;
  };

  const guestOnlyPaths = new Set(["/login", "/registro"]);
  const currentPath = normalizePath(location.pathname);
  const isGuestOnly = guestOnlyPaths.has(currentPath);

  if (isGuestOnly && isLoggedIn(session)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
