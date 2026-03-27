import { Navigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import { getDashboardPathByRole } from "../modules/auth/auth.utils";
import { routePaths } from "../routes/routePaths";

export const SplashPage = () => {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated && user) {
    return <Navigate to={getDashboardPathByRole(user.role)} replace />;
  }

  return <Navigate to={routePaths.login} replace />;
};
