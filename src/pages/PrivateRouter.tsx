
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { authenticated } from "../context/AppContext";

export default function PrivateRouter() {
  const ctx = authenticated();
  const user = (ctx as any)?.user?.user;
  const loading = (ctx as any)?.loading;
  const location = useLocation();

  if (loading) return null;

  if (!user) return <Navigate to="/login" replace />;

  const role = user?.role || "default";

  if(
    role!== "supervisor" &&
    location.pathname.startsWith("/supervisor")
  ) {
    return <Navigate to="/dashboard" replace/>
  }

  return <Outlet />;
}
