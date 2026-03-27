import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import type { UserRole } from "../types/common.types";
import { routePaths } from "./routePaths";

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to={routePaths.login} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={routePaths.unauthorized} replace />;
  }

  return <Outlet />;
};
