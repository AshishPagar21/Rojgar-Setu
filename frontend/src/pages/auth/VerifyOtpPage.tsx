import axios from "axios";
import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

import { OtpForm } from "../../components/auth/OtpForm";
import { PageHeader } from "../../components/common/PageHeader";
import { AuthLayout } from "../../components/layout/AuthLayout";
import { useAuth } from "../../hooks/useAuth";
import { authService } from "../../modules/auth/auth.service";
import { getDashboardPathByRole } from "../../modules/auth/auth.utils";
import { routePaths } from "../../routes/routePaths";
import { getErrorMessage } from "../../utils/helpers";

interface VerifyOtpState {
  mobileNumber: string;
}

export const VerifyOtpPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuthData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const state = location.state as VerifyOtpState | undefined;
  const mobileNumber = state?.mobileNumber;

  if (!mobileNumber) {
    return <Navigate to={routePaths.login} replace />;
  }

  const handleSubmit = async (values: { otp: string }) => {
    setLoading(true);
    setError(undefined);

    try {
      const result = await authService.verifyOtp({
        mobileNumber,
        otp: values.otp,
      });

      setAuthData({
        token: result.token,
        user: result.user,
        profile: result.profile,
      });

      navigate(getDashboardPathByRole(result.user.role), { replace: true });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message =
          (err.response?.data as { message?: string } | undefined)?.message ??
          "";

        if (message.includes("Role is required")) {
          navigate(routePaths.selectRole, {
            state: {
              mobileNumber,
              otp: values.otp,
            },
          });
          return;
        }
      }

      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <PageHeader title="Verify OTP" subtitle={`OTP sent to ${mobileNumber}`} />
      <OtpForm onSubmit={handleSubmit} loading={loading} error={error} />
    </AuthLayout>
  );
};
