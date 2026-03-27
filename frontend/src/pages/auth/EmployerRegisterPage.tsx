import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

import { EmployerRegistrationForm } from "../../components/auth/EmployerRegistrationForm";
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

export const EmployerRegisterPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setAuthData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const state = location.state as RegisterState | undefined;

  if (!state?.mobileNumber || !state?.otp) {
    return <Navigate to={routePaths.login} replace />;
  }

  const handleSubmit = async (values: { name: string }) => {
    setLoading(true);
    setError(undefined);

    try {
      const result = await authService.verifyOtp({
        mobileNumber: state.mobileNumber,
        otp: state.otp,
        role: "EMPLOYER",
        name: values.name,
      });

      setAuthData({
        token: result.token,
        user: result.user,
        profile: result.profile,
      });

      navigate(routePaths.dashboardEmployer, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <PageHeader
        title="Tell us your name"
        subtitle="This helps workers know you"
      />
      <EmployerRegistrationForm
        onSubmit={handleSubmit}
        loading={loading}
        error={error}
      />
    </AuthLayout>
  );
};
