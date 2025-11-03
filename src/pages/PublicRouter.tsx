

import { Navigate, Outlet } from "react-router-dom";
import { authenticated } from "../context/AppContext";

export default function PublicRouter() {
  const ctx = authenticated();
  const user = (ctx as any)?.user;
  const loading = (ctx as any)?.loading;
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return <Outlet />;
}
