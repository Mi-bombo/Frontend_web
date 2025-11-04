import React from 'react'

export const BienvenidaHero: React.FC = () => (
  <section className="flex flex-col items-center py-20">
    <img
      src="/logo-colectivo.png"
      alt="Logo Transporte Formosa"
      className="w-32 mb-8"
    />
    <h1 className="text-5xl font-bold text-gray-900 mb-4 font-serif drop-shadow-md">
      Bienvenido al Sistema de Transporte Público de Formosa
    </h1>
    <p className="text-lg text-gray-600 max-w-xl text-center mb-8">
      Innovación y eficiencia para el transporte urbano. Gestiona rutas, monitorea el estado de la ciudad y conecta conductores y supervisores en tiempo real.
    </p>
    <div className="flex gap-4">
      <a
        href="/login"
        className="px-6 py-3 bg-blue-600 rounded text-white font-semibold shadow hover:bg-blue-700 transition"
      >
        Iniciar sesión
      </a>
      <a
        href="/about"
        className="px-6 py-3 bg-gray-100 rounded text-blue-700 font-semibold shadow hover:bg-blue-200 transition"
      >
        Conoce más
      </a>
    </div>
  </section>
)
