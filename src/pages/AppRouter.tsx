import { Suspense } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom"
import PrivateRouter from "./PrivateRouter";
import PublicRouter from "./PublicRouter";
import LandingPages from "./LandingPages";
import Home from "../view/home/Home";




function AppContent() {
    // const { user } = authenticated();
    const location = useLocation();

    const hideBotPaths = ["/login", "/registro"];
    const shouldShowBot = !hideBotPaths.includes(location.pathname);

    return (
        <>
            {/* {user ? <Header /> : ""} */}
            <Routes>
                <Route element={<LandingPages />}>
                    {/* <Route path="/" element={<Home />} /> */}
                    {/* <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="*" element={<PageForDefault />} /> */}
                </Route>

                <Route > {/* element={<PublicRouter />} */}
                    <Route path="/" element={<Home />} />
                    {/* <Route path="/login" element={<Login />} /> */}
                </Route>

                <Route element={<PrivateRouter />}>
                    {/* Aquí van las vistas privadas */}
                </Route>
            </Routes>
            {/* {user ? <Footer /> : ""}
            {shouldShowBot && <Bot />} */}
        </>
    );
};

export const AppRouter = () => (
    <Suspense fallback={<div>Loading...</div>}>
        <BrowserRouter>
            <AppContent />
        </BrowserRouter>
    </Suspense>
);


