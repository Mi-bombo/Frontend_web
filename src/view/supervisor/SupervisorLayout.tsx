import SidebarSupervisor from "../../components/SidebarSupervisor";
import { Outlet } from "react-router-dom";
import { SupervisorDataProvider } from "./SupervisorDataProvider";

export default function SupervisorLayout() {
  return (
    <SupervisorDataProvider>
      <div className="flex min-h-screen bg-gray-100">
        <SidebarSupervisor />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </SupervisorDataProvider>
  );
}
