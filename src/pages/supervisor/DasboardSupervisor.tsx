export default function DashboardSupervisor() {
    const stats = [
        {label: "Usuarios activos", value:12},
        {label: "Líneas de colectivo", value:12},
        {label: "Obstrucciones activas", value:2},
    ]

    return(
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">Dashboard del Supervisor</h1>
            <div className="grid grid-cols-3 gap-4">
                {stats.map((s) => (
                    <div key={s.label} className="bg-white p-4 rounded-xl shadow text-center">
                        <p className="text-gray-500">{s.label}</p>
                        <p className="text-2xl font-bold">{s.value}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}