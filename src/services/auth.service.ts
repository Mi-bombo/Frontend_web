export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
}

export interface AuthResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// Mock service listo para reemplazar con llamadas reales a backend
export const authService = {
  login: async ({ email, password }: LoginPayload): Promise<AuthResult<{ id: string; email: string }>> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (email && password) {
          resolve({ success: true, data: { id: "mock-user-id", email } });
        } else {
          resolve({ success: false, error: "Credenciales inválidas" });
        }
      }, 600);
    });
  },

  register: async (payload: RegisterPayload): Promise<AuthResult<{ id: string }>> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (payload.email && payload.password && payload.name) {
          resolve({ success: true, data: { id: "mock-created-id" } });
        } else {
          resolve({ success: false, error: "Datos incompletos" });
        }
      }, 800);
    });
  },
};

