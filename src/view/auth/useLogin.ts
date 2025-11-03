import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usersService } from "../../services/user.service";

export function useLogin() {
  const navigate = useNavigate();
  // Llamada al hook al nivel superior (reglas de Hooks)
  const { login } = usersService();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = () => {
    if (!email.trim()) return "El email es requerido";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Email no válido";
    if (!password) return "La contraseña es requerida";
    if (password.length < 6) return "La contraseña debe tener al menos 6 caracteres";
    return null;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const message = validate();
    if (message) {
      setError(message);
      return;
    }
    setLoading(true);
    setError(null);
    const res = await login(email, password);
    setLoading(false);
    if (res.success) {
      navigate("/");
    } else {
      setError(res.error || "No se pudo iniciar sesión");
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    error,
    onSubmit,
  };
}
