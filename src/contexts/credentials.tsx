import { createContext, useState, useContext } from "react";
import { Credential } from "../models";

interface CredentialsContextType {
  credentials: Credential[];
  setCredentials: React.Dispatch<React.SetStateAction<Credential[]>>;
}

const credentialsContext = createContext<CredentialsContextType>({
  credentials: [],
  setCredentials: () => {},
});

interface ProviderProps {
  children: JSX.Element | JSX.Element[];
}

export const CredentialsProvider = ({ children }: ProviderProps) => {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const value = { credentials, setCredentials };

  return (
    <credentialsContext.Provider value={value}>
      {children}
    </credentialsContext.Provider>
  );
};

export const useCredentialsContext = () => {
  const context = useContext(credentialsContext);
  if (context === undefined) {
    throw new Error(
      "useCredentialsContext must be used within a CredentialsProvider"
    );
  }
  return context;
};
