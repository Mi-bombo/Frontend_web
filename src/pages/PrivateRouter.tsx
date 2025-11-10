import { Outlet, Navigate } from "react-router-dom";
import { authenticated } from "../context/AppContext";

export default function PrivateRouter() {
  const ctx: any = authenticated?.();
  const session = ctx?.user;
  const token = session?.token ?? ctx?.token ?? localStorage.getItem("token");
  const rawUser = session?.user ?? session?.User ?? null;
  const isLoggedIn = !!token && !!rawUser;

  return isLoggedIn ? <Outlet /> : <Navigate to="/login" replace />;
}
