import SidebarSupervisor from "../../components/SidebarSupervisor";
import { Outlet } from "react-router-dom";
import { SupervisorDataProvider } from "./SupervisorDataProvider";

export default function SupervisorLayout() {
  return (
    <SupervisorDataProvider>
      <div className="mx-auto flex min-h-screen pt-16">
        <SidebarSupervisor />

        <main className="flex-1 overflow-y-auto bg-gray-100 p-6">
          <Outlet />
        </main>
      </div>
    </SupervisorDataProvider>
  );
}
