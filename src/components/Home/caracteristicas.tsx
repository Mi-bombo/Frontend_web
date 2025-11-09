// components/Caracteristicas.tsx
import React from "react";
import { MdAccessTime, MdPeople } from "react-icons/md";
import { MdMap } from "react-icons/md";

interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const features: Feature[] = [
  {
    title: "Monitoreo en Tiempo Real",
    description: "Visualiza el estado actual del sistema y recibe notificaciones instantáneas de eventos en la ciudad.",
    icon: <MdAccessTime className="w-12 h-12 text-blue-500" />, // Material Icon
  },
  {
    title: "Gestión Centralizada",
    description: "Administra líneas, rutas, paradas y asignación de turnos desde una sola plataforma.",
    icon: <MdMap className="w-12 h-12 text-green-500" />,
  },
  {
    title: "Comunidad Conectada",
    description: "Facilita la comunicación entre colectiveros y supervisores, optimizando la movilidad urbana.",
    icon: <MdPeople className="w-12 h-12 text-yellow-500" />,
  },
];

export const Caracteristicas: React.FC = () => (
  <section className="py-16 bg-white">
    <div className="max-w-5xl mx-auto px-6">
      <h2 className="text-3xl font-bold text-center text-blue-700 mb-12 font-serif">
        Características principales
      </h2>
      <div className="grid md:grid-cols-3 gap-8">
        {features.map((feature, idx) => (
          <div key={idx} className="bg-blue-50 rounded-lg shadow-lg p-6 flex flex-col items-center hover:-translate-y-2 transition">
            <div className="mb-4">{feature.icon}</div>
            <h3 className="text-xl font-semibold mb-2 text-blue-900">{feature.title}</h3>
            <p className="text-gray-700 text-center">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
