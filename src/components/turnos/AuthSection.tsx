import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { ResponseMessage } from "./ResponseMessage";
import type {
  LoginPayload,
  RegisterPayload,
} from "../../services/turnos/types";

type Props = {
  message?: string | null;
  onRegister: (
    payload: RegisterPayload
  ) => Promise<{ success: boolean; error?: string }>;
  onLogin: (
    payload: LoginPayload
  ) => Promise<{ success: boolean; error?: string }>;
};

export function AuthSection({ onRegister, onLogin, message }: Props) {
  return (
    <section className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <RegisterForm onSubmit={onRegister} />
        <LoginForm onSubmit={onLogin} />
      </div>
      <ResponseMessage message={message} />
    </section>
  );
}
