import { Link } from "react-router-dom";
import { useLogin } from "./useLogin";

export default function Login() {
  const { email, setEmail, password, setPassword, loading, error, onSubmit } = useLogin();

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">Iniciar sesión</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          {error && <div className="text-red-600 text-sm">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="tu@email.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="********"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <p className="text-sm text-center mt-4">
          ¿No tienes cuenta? {" "}
          <Link to="/registro" className="text-blue-600 hover:underline">Regístrate</Link>
        </p>
      </div>
    </div>
  );
}

