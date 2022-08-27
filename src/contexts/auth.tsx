import { createContext, useContext, FC, useState } from "react";

interface Auth {
  isAuthenticated: boolean;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
}

export const getInitialAuth = (): Auth => ({
  isAuthenticated: false,
  username: "",
  email: "",
  firstName: "",
  lastName: "",
});

const authContext = createContext({});

interface ProviderProps {
  children: JSX.Element;
}

interface AuthContext {
  auth: Auth;
  setAuth: React.Dispatch<React.SetStateAction<Auth>>;
}

export const AuthProvider = ({ children }: ProviderProps) => {
  const [auth, setAuth] = useState(getInitialAuth());
  const value = { auth, setAuth };

  return <authContext.Provider value={value}>{children}</authContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(authContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within a AuthProvider");
  }
  return context as AuthContext;
};
