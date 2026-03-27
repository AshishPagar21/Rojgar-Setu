import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { MobileNumberForm } from "../../components/auth/MobileNumberForm";
import { AuthLayout } from "../../components/layout/AuthLayout";
import { PageHeader } from "../../components/common/PageHeader";
import { authService } from "../../modules/auth/auth.service";
import { routePaths } from "../../routes/routePaths";
import { getErrorMessage } from "../../utils/helpers";

export const LoginPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const handleSubmit = async (values: { mobileNumber: string }) => {
    setLoading(true);
    setError(undefined);

    try {
      const result = await authService.sendOtp(values);

      navigate(routePaths.verifyOtp, {
        state: {
          mobileNumber: result.data.mobileNumber,
        },
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <PageHeader
        title="Login"
        subtitle="Enter your mobile number to get OTP"
      />
      <MobileNumberForm
        onSubmit={handleSubmit}
        loading={loading}
        error={error}
      />
    </AuthLayout>
  );
};
