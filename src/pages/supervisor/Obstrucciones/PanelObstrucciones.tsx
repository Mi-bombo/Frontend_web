import { useState } from "react";

export default function PanelObstrucciones() {
    const [obstrucciones, setObstrucciones] = useState([
        { id: 1, calle: "Av. 25 de Mayo", severidad: "Alta", estado: "Activa" },
        { id: 2, calle: "Calle San Martín", severidad: "Media", estado: "Resuelta" },
    ]);

    return(
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Panel de obstrucciones</h1>
            <table className="w-full bg-white shadow rounded-lg">
                <thead className="bg-gray-100">
                <tr>
                    <th className="p-2 text-left">ID</th>
                    <th className="p-2 text-left">Calle</th>
                    <th className="p-2 text-left">Severidad</th>
                    <th className="p-2 text-left">Estado</th>
                    <th className="p-2 text-left">Acciones</th>
                </tr>
                </thead>
                <tbody>
                {obstrucciones.map((o) => (
                    <tr key={o.id} className="border-t">
                    <td className="p-2">{o.id}</td>
                    <td className="p-2">{o.calle}</td>
                    <td className="p-2">{o.severidad}</td>
                    <td className="p-2">{o.estado}</td>
                    <td className="p-2">
                        {o.estado === "Activa" && (
                        <button
                            className="bg-green-500 text-white px-3 py-1 rounded"
                            onClick={() =>
                            setObstrucciones((prev) =>
                                prev.map((x) =>
                                x.id === o.id ? { ...x, estado: "Resuelta" } : x
                                )
                            )
                            }
                        >
                            Marcar resuelta
                        </button>
                        )}
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    )
}