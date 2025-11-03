import { createContext, useContext, useEffect, useState } from "react";
import { usersService } from "../services/user.service";

type MinimalUser = {
  id: string;
  name?: string;
  last_name?: string;
  email?: string;
  role?: string;
};

export type AuthState =
  | { token?: string; user?: MinimalUser }
  | [any, { user?: MinimalUser }]
  | null
  | undefined;

type CtxValue = {
  login: ReturnType<typeof usersService>["login"];
  userSession: ReturnType<typeof usersService>["userSession"];
  registerUser: ReturnType<typeof usersService>["registerUser"];
  logoutUser: ReturnType<typeof usersService>["logoutUser"];
  user: AuthState;
  loading: boolean;
};

const NewContext = createContext<CtxValue | undefined>(undefined);

export const ContextUser = ({ children }: { children: React.ReactNode }) => {
  const { login, user, registerUser, userSession, logoutUser } = usersService();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        await userSession();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <NewContext.Provider
      value={{
        user: user as AuthState,
        userSession,
        login,
        registerUser,
        logoutUser,
        loading,
      }}
    >
      {children}
    </NewContext.Provider>
  );
};

export const authenticated = () => useContext(NewContext);
