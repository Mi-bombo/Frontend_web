
interface ModalHeaderProps {
  logoSrc?: string;
  nombreSistema: string;
  onBack?: () => void;
  className?: string;
}

export default function ModalHeader({
  logoSrc = "/logo-colectivo.png", 
  nombreSistema,
  onBack,
  className = "",
}: ModalHeaderProps) {
  return (
    <header className={`flex items-center justify-between px-8 py-4 bg-gradient-to-r from-blue-100 via-white to-blue-100 border-b border-blue-200 ${className} mb-10`}>
  <div className="flex items-center gap-3">
    {onBack && (
      <button
        className="flex items-center justify-center mr-5 w-11 h-11 bg-blue-50 border border-blue-200 text-blue-800 rounded-full shadow hover:bg-blue-100 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
        onClick={onBack}
        aria-label="Volver"
        type="button"
      >
        <svg width="28" height="28" fill="none" viewBox="0 0 25 20">
          <path d="M14 5l-4.5 5L14 15" stroke="#1976d2" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </button>
    )}
    {logoSrc && (
      <img src={logoSrc} alt="Logo" className="w-10 h-10 object-contain rounded-full shadow" />
    )}
    <span className="text-2xl font-bold text-blue-800 tracking-tight">{nombreSistema}</span>
  </div>
</header>
  );
}
