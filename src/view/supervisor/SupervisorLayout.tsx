import SidebarSupervisor from "../../components/SidebarSupervisor";
import { Outlet } from "react-router-dom";

export default function SupervisorLayout() {
    return (
        <div className="flex min-h-screen">
        <SidebarSupervisor />

        <main className="flex-1 bg-gray-100 p-6 overflow-y-auto">
            <Outlet />
        </main>
        </div>
    );
}
