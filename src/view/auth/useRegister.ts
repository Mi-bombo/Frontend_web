import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usersService } from "../../services/user.service";

export function useRegister() {
  const navigate = useNavigate();
  // Llamar al hook en el nivel superior (reglas de Hooks)
  const { registerUser } = usersService();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = () => {
    if (!name.trim()) return "El nombre es requerido";
    if (!email.trim()) return "El email es requerido";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Email no válido";
    if (!password) return "La contraseña es requerida";
    if (password.length < 6)
      return "La contraseña debe tener al menos 6 caracteres";
    if (password !== confirmPassword) return "Las contraseñas no coinciden";
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
    const res = await registerUser(name, email, password);
    setLoading(false);
    if (res.success) {
      navigate("/login");
    } else {
      setError(res.error || "No se pudo registrar");
    }
  };

  return {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    loading,
    error,
    onSubmit,
  };
}
