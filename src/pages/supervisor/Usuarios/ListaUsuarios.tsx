import { useState } from "react";

type Usuario = {
    id: number;
    nombre: string;
    rol: "Supervisor" | "Colectivero";
}

export default function ListaUsuarios() {
    const [usuarios, setUsuarios] = useState<Usuario[]>([
        { id: 1, nombre: "Carlos Gómez", rol: "Supervisor" },
        { id: 2, nombre: "María López", rol: "Colectivero" },
    ]);

    return(
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Gestión de usuarios</h1>
            <table className="w-full bg-white shadow rounded-lg">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="p-2 text-left">ID</th>
                        <th className="p-2 text-left">Nombre</th>
                        <th className="p-2 text-left">Rol</th>
                        <th className="p-2 text-left">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {usuarios.map((u) => (
                        <tr key={u.id} className="border-t">
                            <td className="p-2">{u.id}</td>
                            <td className="p-2">{u.nombre}</td>
                            <td className="p-2">{u.rol}</td>
                            <td className="p-2">
                                <button className="bg-blue-500 text-white px-3 py-1 rounded mr-2">Editar</button>
                                <button className="bg-red-500 text-white px-3 py-1 rounded">Eliminar</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}