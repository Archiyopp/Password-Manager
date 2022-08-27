import { Navigate } from "react-router-dom";
import { useAuthContext } from "../contexts/auth";

interface GuardProps {
  children: JSX.Element;
}

export function AuthGuard({ children }: GuardProps) {
  const { auth } = useAuthContext();
  if (auth.isAuthenticated) {
    return children;
  } else {
    return <Navigate to="/login" />;
  }
}
