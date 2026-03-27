import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

import { WorkerRegistrationForm } from "../../components/auth/WorkerRegistrationForm";
import { PageHeader } from "../../components/common/PageHeader";
import { AuthLayout } from "../../components/layout/AuthLayout";
import { useAuth } from "../../hooks/useAuth";
import { authService } from "../../modules/auth/auth.service";
import { routePaths } from "../../routes/routePaths";
import { getErrorMessage } from "../../utils/helpers";

interface RegisterState {
  mobileNumber: string;
  otp: string;
}

export const WorkerRegisterPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { setAuthData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const state = location.state as RegisterState | undefined;

  if (!state?.mobileNumber || !state?.otp) {
    return <Navigate to={routePaths.login} replace />;
  }

  const handleSubmit = async (values: {
    name: string;
    age: number;
    area: string;
    workType: string;
    gender: "MALE" | "FEMALE" | "OTHER";
  }) => {
    setLoading(true);
    setError(undefined);

    try {
      const result = await authService.verifyOtp({
        mobileNumber: state.mobileNumber,
        otp: state.otp,
        role: "WORKER",
        name: values.name,
        age: values.age,
        area: values.area,
        workType: values.workType,
        gender: values.gender,
      });

      setAuthData({
        token: result.token,
        user: result.user,
        profile: result.profile,
      });

      navigate(routePaths.dashboardWorker, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <PageHeader
        title={t("auth.workerTitle")}
        subtitle={t("auth.workerSubtitle")}
      />
      <WorkerRegistrationForm
        onSubmit={handleSubmit}
        loading={loading}
        error={error}
      />
    </AuthLayout>
  );
};
