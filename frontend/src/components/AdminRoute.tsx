import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute() {
  const { hasRole } = useAuth();

  if (!hasRole("ROLE_ADMIN")) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}