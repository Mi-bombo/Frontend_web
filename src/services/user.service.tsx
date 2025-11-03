import { useState } from "react";
export const Url = "http://localhost:4000/api/auth/"

interface IUser {
    name: string;
    lastName: string;
    phone: string;
    email: string;
    password?: string;
}

export const usersService = () => {
    const [user, setUser] = useState<IUser | null>(null)


    const login = async (email: string, password: string) => {
        try {
            const response = await fetch(`${Url}login`, {
                method: 'POST',
                credentials: "include",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            if (response.ok) {
                const data = await response.json()
                setUser(data)
                return { success: true, error: data }
            } else {
                setUser(null)
                const error = await response.json()
                return { success: false, error }

            }
        } catch (error) {
            console.error("Error en la petición de login:", error);
            throw error;
        }
    };

    const registerUser = async (name: string, lastName: string, phone: string, email: string, password: string) => {
        try {
            const response = await fetch(`${Url}register`, {
                method: 'POST',
                credentials: "include",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, lastName, phone, email, password })
            });
            const data = await response.json();
            if (response.ok) {
                return { success: true, error: data };
            } else {
                return { success: false, error: data };
            }

        } catch (error) {
            console.error("Error en la petición de registro.", error);
            throw error;
        }
    };

    const userSession = async () => {
        try {
            const response = await fetch(`${Url}session`, {
                method: "GET",
                credentials: "include"
            })
            if (response.ok) {
                const data = await response.json()
                return setUser(data)
            } else {
                return setUser(null)
            }
        } catch (error) {
            console.error("Error al obtener la session")
        }
    }

    const logoutUser = async () => {
        try {
            const response = await fetch(`${Url}logout`, {
                method: "POST",
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

    return { login, user, userSession, registerUser, logoutUser }

}