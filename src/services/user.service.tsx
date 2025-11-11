import { useState } from "react";

const BASE = (import.meta.env.VITE_AUTH_API ?? "http://127.0.0.1:4000/auth")
  .replace(/\/+$/, "");

export const Url = `${BASE}/`;

interface IUser {
  name: string;
  lastName: string;
  phone: string;
  email: string;
  password?: string;
}

export const usersService = () => {
  const [user, setUser] = useState<IUser | null>(null);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${Url}login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-platform": "web",
        },
        body: JSON.stringify({ email, password }),
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
        return { success: true, data };
      } else {
        setUser(null);
        const err = await response.json().catch(() => ({}));
        const message =
          err?.error || err?.message || "No se pudo iniciar sesión";
        return { success: false, error: message };
      }
    } catch (error) {
      console.error("Error en la petición de login:", error);
      return {
        success: false,
        error: (error as any)?.message || "Error de red",
      };
    }
  };

  const registerUser = async (
    name: string,
    email: string,
    password: string
  ) => {
    try {
      const response = await fetch(`${Url}register`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-platform": "web",
        },
        // Backend espera: { nombre, email, password, role? }
        body: JSON.stringify({ nombre: name, email, password }),
      });
      const data = await response.json().catch(() => ({}));
      console.log(data);
      if (response.ok) {
        return { success: true, data };
      } else {
        const message = data?.error || data?.message || "No se pudo registrar";
        return { success: false, error: message };
      }
    } catch (error) {
      console.error("Error en la petición de registro.", error);
      return {
        success: false,
        error: (error as any)?.message || "Error de red",
      };
    }
  };

  const userSession = async () => {
    try {
      const response = await fetch(`${Url}session`, {
        method: "GET",
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        return setUser(data);
      } else {
        return setUser(null);
      }
    } catch (error) {
      console.error("Error al obtener la session");
    }
  };

  const logoutUser = async () => {
    try {
      const response = await fetch(`${Url}logout`, {
        method: "DELETE",
        credentials: "include",
      });
      if (response.ok) {
        setUser(null);
      } else {
        console.error("Error al cerrar sesión");
      }
    } catch (error) {
      console.error("Error durante el logout:", error);
    }
  };

  return { login, user, userSession, registerUser, logoutUser };
};
