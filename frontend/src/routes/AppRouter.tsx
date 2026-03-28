import { Navigate, Route, Routes } from "react-router-dom";

import { ProtectedLayout } from "../components/layout/ProtectedLayout";
import { EmployerRegisterPage } from "../pages/auth/EmployerRegisterPage";
import { LoginPage } from "../pages/auth/LoginPage";
import { SelectRolePage } from "../pages/auth/SelectRolePage";
import { VerifyOtpPage } from "../pages/auth/VerifyOtpPage";
import { WorkerRegisterPage } from "../pages/auth/WorkerRegisterPage";
import { AttendanceHistoryPage } from "../pages/attendance/AttendanceHistoryPage";
import { NotFoundPage } from "../pages/common/NotFoundPage";
import { UnauthorizedPage } from "../pages/common/UnauthorizedPage";
import { AdminDashboardPage } from "../pages/dashboard/AdminDashboardPage";
import { EmployerDashboardPage } from "../pages/dashboard/EmployerDashboardPage";
import { WorkerDashboardPage } from "../pages/dashboard/WorkerDashboardPage";
import { AssignedJobsPage } from "../pages/jobApplication/AssignedJobsPage";
import { MyApplicationsPage } from "../pages/jobApplication/MyApplicationsPage";
import { BrowseJobsPage } from "../pages/jobs/BrowseJobsPage";
import { CreateJobPage } from "../pages/jobs/CreateJobPage";
import { EmployerJobDetailsPage } from "../pages/jobs/EmployerJobDetailsPage";
import { JobPaymentsPage } from "../pages/jobs/JobPaymentsPage";
import { MyJobsPage } from "../pages/jobs/MyJobsPage";
import { SelectWorkersPage } from "../pages/jobs/SelectWorkersPage";
import { WorkerJobDetailsPage } from "../pages/jobs/WorkerJobDetailsPage";
import { PaymentHistoryPage } from "../pages/payment/PaymentHistoryPage";
import { ReceivedRatingsPage } from "../pages/rating/ReceivedRatingsPage";
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
            <Route path="/jobs/create" element={<CreateJobPage />} />
            <Route path="/jobs/my" element={<MyJobsPage />} />
            <Route path="/jobs/:jobId" element={<EmployerJobDetailsPage />} />
            <Route
              path="/jobs/:jobId/applicants"
              element={<SelectWorkersPage />}
            />
            <Route path="/jobs/:jobId/payments" element={<JobPaymentsPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["WORKER"]} />}>
            <Route
              path={routePaths.dashboardWorker}
              element={<WorkerDashboardPage />}
            />
            <Route path="/jobs/open" element={<BrowseJobsPage />} />
            <Route
              path="/jobs/open/:jobId"
              element={<WorkerJobDetailsPage />}
            />
            <Route path="/applications/my" element={<MyApplicationsPage />} />
            <Route path="/jobs/assigned" element={<AssignedJobsPage />} />
            <Route path="/attendance/my" element={<AttendanceHistoryPage />} />
            <Route path="/payments/my" element={<PaymentHistoryPage />} />
            <Route
              path="/ratings/my-received"
              element={<ReceivedRatingsPage />}
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
