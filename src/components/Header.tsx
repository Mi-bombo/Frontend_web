import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

type NavLinkItem = {
  to: string;
  label: string;
  end?: boolean;
};

type NavLinkStatus = {
  isActive: boolean;
  isPending: boolean;
  isTransitioning: boolean;
};

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const handleSubmit = () => {
    // await logoutUser();
    navigate("/");
  };

  const navLinks = useMemo<NavLinkItem[]>(
    () => [
      { to: "/", label: "Inicio", end: true },
      { to: "/dashboard", label: "Dashboard" },
      { to: "/map", label: "Mapa" },
    ],
    []
  );

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const linkClasses = ({ isActive }: NavLinkStatus) =>
    `relative inline-flex items-center px-3 py-2 text-sm font-semibold transition-colors duration-200 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:transform after:bg-blue-600 after:transition-transform after:duration-300 after:ease-out after:content-[''] hover:after:scale-x-100 ${
      isActive
        ? scrolled
          ? "text-blue-600 after:scale-x-100"
          : "text-blue-300 after:scale-x-100"
        : scrolled
        ? "text-slate-600 hover:text-blue-600"
        : "text-slate-100 hover:text-blue-200"
    }`;

  const brandButtonClasses = `rounded-full border px-3 py-1 text-sm font-semibold uppercase tracking-[0.3em] shadow-lg backdrop-blur-md transition md:px-4 ${
    scrolled
      ? "border-slate-200 bg-white text-slate-900 shadow-slate-900/5 hover:bg-slate-100"
      : "border-white/10 bg-white/20 text-white shadow-slate-900/30 hover:bg-white/30 hover:text-blue-100"
  }`;

  const taglineClass = scrolled
    ? "hidden border-l border-slate-200 pl-4 text-xs font-medium uppercase tracking-wide text-slate-500 md:inline"
    : "hidden border-l border-white/20 pl-4 text-xs font-medium uppercase tracking-wide text-blue-100 md:inline";

  const mobileLinkClasses = ({ isActive }: NavLinkStatus) =>
    `relative inline-flex items-center rounded-lg px-3 py-2 text-sm font-semibold transition-colors duration-200 ${
      isActive
        ? "bg-blue-50 text-blue-600"
        : "text-slate-700 hover:bg-slate-100 hover:text-blue-600"
    }`;

  return (
    <header
      className={`fixed top-0 left-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-white/90 shadow-lg shadow-slate-900/10 backdrop-blur"
          : "bg-gradient-to-b from-slate-950/60 via-slate-900/40 to-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <button
            type="button"
            className={brandButtonClasses}
            onClick={() => navigate("/")}
          >
            Event-Driven
          </button>
          <span className={taglineClass}>vosave</span>
        </div>

        <nav className="hidden items-center gap-2 md:flex">
          {navLinks.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end} className={linkClasses}>
              {label}
            </NavLink>
          ))}
          <button
            type="button"
            onClick={handleSubmit}
            className="ml-4 inline-flex items-center rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700"
          >
            Cerrar sesión
          </button>
        </nav>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/20 text-white shadow-md shadow-slate-900/30 backdrop-blur transition hover:bg-white/30 hover:text-blue-100 md:hidden"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-label="Toggle navigation menu"
        >
          <span className="sr-only">Abrir menú</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.8}
            stroke="currentColor"
            className="h-6 w-6"
          >
            {isMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 5.75h16.5M3.75 12h16.5m-16.5 6.25h16.5"
              />
            )}
          </svg>
        </button>
      </div>

      {isMenuOpen && (
        <div className="mx-4 mb-4 rounded-2xl border border-white/10 bg-white/95 p-4 text-slate-700 shadow-lg shadow-slate-900/10 backdrop-blur md:hidden">
          <nav className="flex flex-col gap-2">
            {navLinks.map(({ to, label, end }) => (
              <NavLink key={to} to={to} end={end} className={mobileLinkClasses}>
                {label}
              </NavLink>
            ))}
            <button
              type="button"
              onClick={handleSubmit}
              className="mt-2 inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700"
            >
              Cerrar sesión
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
