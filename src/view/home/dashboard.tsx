import Header from "../../components/Navbar";
import SidebarSupervisor from "../../components/SidebarSupervisor";
import { authenticated } from "../../context/AppContext";

const mapRole = (user: any) => {
  if (!user) return undefined;
  if (user.role) return user.role;
  if (typeof user.rol_id === "number") {
    if (user.rol_id === 1) return "supervisor";
    if (user.rol_id === 2) return "chofer";
  }
  return undefined;
};

const GreetingCard = ({ role, name }: { role?: string; name?: string }) => (
  <section className="rounded-2xl bg-white p-6 shadow-xl shadow-slate-900/5">
    <p className="text-sm uppercase tracking-wide text-slate-500">Bienvenido</p>
    <h1 className="mt-2 text-2xl font-semibold text-slate-900">
      {name ? `${name}!` : "Usuario!"}
    </h1>
    <p className="mt-4 text-slate-600">
      Estás en tu panel principal como{" "}
      <span className="font-semibold text-blue-600">
        {role === "supervisor" ? "Supervisor" : "Chofer"}
      </span>
      . Aquí vas a encontrar accesos rápidos y el resumen de tus tareas.
    </p>
  </section>
);

export function Dashboard() {
  const ctx = authenticated();
  const session = (ctx as any)?.user;
  const loading = (ctx as any)?.loading;

  if (loading) return null;

  const user = session?.User ?? session?.user ?? null;
  const role = mapRole(user) ?? "chofer";
  const name =
    user?.name || user?.Nombre || user?.first_name || user?.email || "";

  const content = (
    <div className="space-y-6">
      <GreetingCard role={role} name={name} />
      <div className="grid gap-6 md:grid-cols-2">
        <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">
            Próximos turnos
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Aquí verás tus próximos turnos asignados apenas estén disponibles.
          </p>
        </article>
        <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">
            Novedades del sistema
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Te avisaremos por acá cualquier novedad respecto a la operación.
          </p>
        </article>
      </div>
    </div>
  );

  if (role === "supervisor") {
    return (
      <div className="flex min-h-screen bg-slate-100">
        <SidebarSupervisor />
        <main className="flex-1 overflow-y-auto p-8">{content}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* <Header /> */}
      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 pt-32 pb-16">
        {content}
      </main>
    </div>
  );
}
