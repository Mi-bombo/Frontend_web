export const turnosApiConfig = {
  authBaseUrl: import.meta.env.VITE_AUTH_API ?? "http://localhost:4000/auth",
  supervisorBaseUrl:
    import.meta.env.VITE_SUPERVISOR_API ?? "http://localhost:2000/supervisor",
  choferBaseUrl:
    import.meta.env.VITE_CHOFER_API ?? "http://localhost:2000/chofer",
};

export const withAuth = (token?: string): Record<string, string> =>
  token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
