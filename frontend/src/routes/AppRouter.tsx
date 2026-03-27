import { Navigate, Route, Routes } from "react-router-dom";

import { ProtectedLayout } from "../components/layout/ProtectedLayout";
import { EmployerRegisterPage } from "../pages/auth/EmployerRegisterPage";
import { LoginPage } from "../pages/auth/LoginPage";
import { SelectRolePage } from "../pages/auth/SelectRolePage";
import { VerifyOtpPage } from "../pages/auth/VerifyOtpPage";
import { WorkerRegisterPage } from "../pages/auth/WorkerRegisterPage";
import { NotFoundPage } from "../pages/common/NotFoundPage";
import { UnauthorizedPage } from "../pages/common/UnauthorizedPage";
import { AdminDashboardPage } from "../pages/dashboard/AdminDashboardPage";
import { EmployerDashboardPage } from "../pages/dashboard/EmployerDashboardPage";
import { WorkerDashboardPage } from "../pages/dashboard/WorkerDashboardPage";
import { SplashPage } from "../pages/SplashPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { PublicRoute } from "./PublicRoute";
import { routePaths } from "./routePaths";

export const AppRouter = () => {
  return (
    <Routes>
      <Route path={routePaths.root} element={<SplashPage />} />

      <Route element={<PublicRoute />}>
        <Route path={routePaths.login} element={<LoginPage />} />
        <Route path={routePaths.verifyOtp} element={<VerifyOtpPage />} />
        <Route path={routePaths.selectRole} element={<SelectRolePage />} />
        <Route
          path={routePaths.registerEmployer}
          element={<EmployerRegisterPage />}
        />
        <Route
          path={routePaths.registerWorker}
          element={<WorkerRegisterPage />}
        />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<ProtectedLayout />}>
          <Route element={<ProtectedRoute allowedRoles={["EMPLOYER"]} />}>
            <Route
              path={routePaths.dashboardEmployer}
              element={<EmployerDashboardPage />}
            />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["WORKER"]} />}>
            <Route
              path={routePaths.dashboardWorker}
              element={<WorkerDashboardPage />}
            />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
            <Route
              path={routePaths.dashboardAdmin}
              element={<AdminDashboardPage />}
            />
          </Route>
        </Route>
      </Route>

      <Route path={routePaths.unauthorized} element={<UnauthorizedPage />} />
      <Route path="*" element={<NotFoundPage />} />
      <Route
        path="/dashboard"
        element={<Navigate to={routePaths.root} replace />}
      />
    </Routes>
  );
};
