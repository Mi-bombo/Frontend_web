import { Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import PrivateRouter from "./PrivateRouter";
import PublicRouter from "./PublicRouter";
import Home from "../view/home/Home";
import Login from "../view/auth/Login";
import Register from "../view/auth/Register";
import { Dashboard } from "../view/home/dashboard";
import { About } from "../view/home/About";
import TurnosApp from "../view/turnos/TurnosApp";
import Header from "../components/Navbar";

import DashboardSupervisor from "./supervisor/DashboardSupervisor";
import ListaUsuarios from "./supervisor/Usuarios/ListaUsuarios";
import { CrudLineas } from "./supervisor/Lineas/CrudLineas";
import PanelObstrucciones from "./supervisor/Obstrucciones/PanelObstrucciones";
import SupervisorLayout from "../view/supervisor/SupervisorLayout";
import GestionTurnos from "./supervisor/Turnos/GestionTurnos";
import AsignarTurno from "./supervisor/Asignacion/AsignarTurno";

function AppContent() {
  const { pathname } = useLocation();
  const hideHeader = pathname.startsWith("/supervisor");

  const publicRoutes = [
    { path: "/", element: <Home /> },
    { path: "/login", element: <Login /> },
    { path: "/registro", element: <Register /> },
    { path: "/about", element: <About /> },
    { path: "/lin", element: <CrudLineas /> },
  ];

  const privateRoutes = [
    { path: "/dashboard", element: <Dashboard /> },
    { path: "/turnos", element: <TurnosApp /> },

    {
      path: "/supervisor",
      element: <SupervisorLayout />,
      children: [
        { index: true, element: <DashboardSupervisor /> },
        { path: "usuarios", element: <ListaUsuarios /> },
        { path: "lineas", element: <CrudLineas /> },
        { path: "turnos", element: <GestionTurnos /> },
        { path: "obstrucciones", element: <PanelObstrucciones /> },
        { path: "asignar-turnos", element: <AsignarTurno /> },
      ],
    },
  ];

  return (
    <>
      {!hideHeader && <Header />}

      <Routes>
        <Route element={<PublicRouter />}>
          {publicRoutes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
        </Route>

        <Route element={<PrivateRouter />}>
          {privateRoutes.map(({ path, element, children }) =>
            children ? (
              <Route key={path} path={path} element={element}>
                {children.map(({ path: childPath, element: childEl, index }) =>
                  index ? (
                    <Route key="index" index element={childEl} />
                  ) : (
                    <Route key={childPath} path={childPath} element={childEl} />
                  )
                )}
              </Route>
            ) : (
              <Route key={path} path={path} element={element} />
            )
          )}
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export const AppRouter = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  </Suspense>
);
