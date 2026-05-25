import axios from "axios";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

import { OtpForm } from "../../components/auth/OtpForm";
import { PageHeader } from "../../components/common/PageHeader";
import { AuthLayout } from "../../components/layout/AuthLayout";
import { useAuth } from "../../hooks/useAuth";
import { authService } from "../../modules/auth/auth.service";
import { getDashboardPathByRole } from "../../modules/auth/auth.utils";
import { routePaths } from "../../routes/routePaths";
import { getErrorMessage } from "../../utils/helpers";
import { Button } from "../../components/common/Button";

interface VerifyOtpState {
  mobileNumber: string;
}

const OTP_EXPIRY_SECONDS = 600; // 10 minutes
const RESEND_DELAY_SECONDS = 30; // 30 seconds

export const VerifyOtpPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuthData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [timeRemaining, setTimeRemaining] = useState(OTP_EXPIRY_SECONDS);
  const [canResend, setCanResend] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  const state = location.state as VerifyOtpState | undefined;
  const mobileNumber = state?.mobileNumber;

  if (!mobileNumber) {
    return <Navigate to={routePaths.login} replace />;
  }

  // OTP Expiry Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Resend Button Timer
  useEffect(() => {
    if (resendCountdown <= 0) {
      setCanResend(true);
      return;
    }

    setCanResend(false);
    const timer = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCountdown]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    setError(undefined);

    try {
      await authService.resendOtp({ mobileNumber });
      setResendCountdown(RESEND_DELAY_SECONDS);
      setTimeRemaining(OTP_EXPIRY_SECONDS);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsResending(false);
    }
  };

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
      <PageHeader
        title={t("auth.verifyOtpTitle")}
        subtitle={t("auth.otpSentTo", { mobileNumber })}
      />
      <OtpForm onSubmit={handleSubmit} loading={loading} error={error} />

      {/* OTP Expiry Timer */}
      <div className="mt-4 text-center text-sm">
        {timeRemaining > 0 ? (
          <p className="text-gray-600">
            {t("auth.otpExpiresIn")}{" "}
            <span className="font-semibold">{formatTime(timeRemaining)}</span>
          </p>
        ) : (
          <p className="text-red-600 font-semibold">{t("auth.otpExpired")}</p>
        )}
      </div>

      {/* Resend OTP Button */}
      <div className="mt-6">
        {canResend ? (
          <Button
            fullWidth
            variant="secondary"
            onClick={handleResendOtp}
            loading={isResending}
            disabled={timeRemaining === 0}
          >
            {t("auth.resendOtp")}
          </Button>
        ) : (
          <Button fullWidth variant="secondary" disabled>
            {t("auth.resendOtpIn")} {resendCountdown}s
          </Button>
        )}
      </div>

      {/* Mobile Number Display */}
      <p className="mt-4 text-center text-xs text-gray-500">
        {t("auth.wrongNumber")}{" "}
        <a href={routePaths.login} className="text-blue-600 hover:underline">
          {t("auth.changeNumber")}
        </a>
      </p>
    </AuthLayout>
  );
};
