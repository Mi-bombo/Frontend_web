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

function AppContent() {
  const location = useLocation();

  const hideBotPaths = ["/login", "/registro"];
  const shouldShowBot = !hideBotPaths.includes(location.pathname);

  // Template de rutas para fácil edición
  const publicRoutes = [
    { path: "/", element: <Home /> },
    { path: "/login", element: <Login /> },
    { path: "/registro", element: <Register /> },
    // Agrega más rutas públicas aquí
  ];

  const privateRoutes = [
    { path: "/dashboard", element: <Dashboard /> },
    // Agrega más rutas privadas aquí
  ];

  return (
    <>
      <Header />
      <Routes>
        {/* Sección de landing si la usas para layouts o páginas estáticas */}
        {/* <Route element={<LandingPages />} /> */}

        {/* Rutas públicas: solo para usuarios sin sesión */}
        <Route element={<PublicRouter />}>
          {publicRoutes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
        </Route>

        {/* Rutas privadas: requieren sesión */}
        <Route element={<PrivateRouter />}>
          {privateRoutes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {/* {user ? <Footer /> : ""}
      {shouldShowBot && <Bot />} */}
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
