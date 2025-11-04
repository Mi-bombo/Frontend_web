import { Suspense } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import PrivateRouter from "./PrivateRouter";
import PublicRouter from "./PublicRouter";
import LandingPages from "./LandingPages";
import Home from "../view/home/Home";
import Login from "../view/auth/Login";
import Register from "../view/auth/Register";
import Header from "../components/Header";
import { Dashboard } from "../view/home/dashboard";

// Supervisor
import DashboardSupervisor from "./supervisor/DasboardSupervisor";
import ListaUsuarios from "./supervisor/Usuarios/ListaUsuarios";
import ListaLineas from "./supervisor/Lineas/ListaLineas";
import PanelObstrucciones from "./supervisor/Obstrucciones/PanelObstrucciones";
import SupervisorLayout from "../view/supervisor/SupervisorLayout";

function AppContent() {
  const location = useLocation();

  const hideBotPaths = ["/login", "/registro"];
  const shouldShowBot = !hideBotPaths.includes(location.pathname);

  const publicRoutes = [
    { path: "/", element: <Home /> },
    { path: "/login", element: <Login /> },
    { path: "/registro", element: <Register /> },
    // Agrega más rutas públicas aquí
  ];

  const privateRoutes = [
    { path: "/dashboard", element: <Dashboard /> },

    // Grupo de rutas del supervisor (layout + subrutas)
    {
      path: "/supervisor",
      element: <SupervisorLayout />,
      children: [
        { index: true, element: <DashboardSupervisor /> },
        { path: "usuarios", element: <ListaUsuarios /> },
        { path: "lineas", element: <ListaLineas /> },
        { path: "obstrucciones", element: <PanelObstrucciones /> },
      ],
    },
  ];

  return (
    <>
      <Header />
      <Routes>
        {/* RUTAS PÚBLICAS */}
        <Route element={<PublicRouter />}>
          {publicRoutes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
        </Route>

        {/* RUTAS PRIVADAS */}
        <Route element={<PrivateRouter />}>
          {privateRoutes.map(({ path, element, children }) =>
            children ? (
              // Rutas anidadas (ej: supervisor)
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

      {/* Opcional */}
      {/* {shouldShowBot && <Bot />} */}
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
