import { useState } from "react";

export default function ListaLineas() {
    const [lineas] = useState([
        { id: 1, nombre: "Línea 10", recorridos: 8 },
        { id: 2, nombre: "Línea 25", recorridos: 5 },
    ]);

    return(
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Gestión de Líneas</h1>
            <table className="w-full bg-white shadow rounded-lg">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="p-2 text-left">ID</th>
                        <th className="p-2 text-left">Nombre</th>
                        <th className="p-2 text-left">Recorridos</th>
                        <th className="p-2 text-left">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {lineas.map((l) => (
                        <tr key={l.id} className="border-t">
                            <td className="p-2">{l.id}</td>
                            <td className="p-2">{l.nombre}</td>
                            <td className="p-2">{l.recorridos}</td>
                            <td className="p-2">
                                <button className="bg-green-500 text-white px-3 py-1 rounded">Ver rutas</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}