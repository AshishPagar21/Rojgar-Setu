import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { RouteProp } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { AuthLayout } from "../../components/layout/AuthLayout";
import { PageHeader } from "../../components/common/PageHeader";
import { OtpForm } from "../../components/auth/OtpForm";
import { Button } from "../../components/common/Button";
import { authService } from "../../modules/auth/auth.service";
import { useAuth } from "../../hooks/useAuth";
import {
  OTP_EXPIRY_SECONDS,
  OTP_RESEND_DELAY_SECONDS,
} from "../../utils/constants";
import { formatTime } from "../../utils/formatters";
import { getErrorMessage } from "../../utils/helpers";

type Props = {
  navigation: any;
  route: RouteProp<Record<string, { mobileNumber?: string }>, string>;
};

export const VerifyOtpScreen = ({ navigation, route }: Props) => {
  const { t } = useTranslation();
  const mobileNumber = route.params?.mobileNumber;
  const { setAuthData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [timeRemaining, setTimeRemaining] = useState(OTP_EXPIRY_SECONDS);
  const [canResend, setCanResend] = useState(true);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!mobileNumber) {
      navigation.replace("Login");
    }
  }, [mobileNumber, navigation]);

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

  const handleSubmit = async (values: { otp: string }) => {
    if (!mobileNumber) return;

    setLoading(true);
    setError(undefined);

    try {
      const result = await authService.verifyOtp({
        mobileNumber,
        otp: values.otp,
      });

      await setAuthData({
        token: result.token,
        user: result.user,
        profile: result.profile,
      });
    } catch (err) {
      const message = getErrorMessage(err);
      if (message.includes("Role is required")) {
        navigation.navigate("SelectRole", {
          mobileNumber,
          otp: values.otp,
        });
        return;
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!mobileNumber) return;

    setIsResending(true);
    setError(undefined);

    try {
      await authService.resendOtp({ mobileNumber });
      setResendCountdown(OTP_RESEND_DELAY_SECONDS);
      setTimeRemaining(OTP_EXPIRY_SECONDS);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsResending(false);
    }
  };

  if (!mobileNumber) {
    return null;
  }

  return (
    <AuthLayout>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <PageHeader
            title={t("auth.verifyOtpTitle")}
            subtitle={t("auth.otpSentTo", { mobileNumber })}
          />
          <OtpForm onSubmit={handleSubmit} loading={loading} error={error} />

          <View style={{ marginTop: 16, alignItems: "center" }}>
            {timeRemaining > 0 ? (
              <Text style={{ color: "#475569", fontSize: 13 }}>
                {t("auth.otpExpiresIn")}{" "}
                <Text style={{ fontWeight: "700" }}>
                  {formatTime(timeRemaining)}
                </Text>
              </Text>
            ) : (
              <Text
                style={{ color: "#dc2626", fontSize: 13, fontWeight: "700" }}
              >
                {t("auth.otpExpired")}
              </Text>
            )}
          </View>

          <View style={{ marginTop: 16 }}>
            {canResend ? (
              <Button
                fullWidth
                variant="secondary"
                loading={isResending}
                onPress={handleResendOtp}
              >
                {t("auth.resendOtp")}
              </Button>
            ) : (
              <Button fullWidth variant="secondary" disabled>
                {t("auth.resendOtpIn", { count: resendCountdown })}
              </Button>
            )}
          </View>

          <TouchableOpacity
            style={{ marginTop: 16, alignSelf: "center" }}
            onPress={() => navigation.replace("Login")}
          >
            <Text style={{ color: "#475569", fontSize: 12 }}>
              {t("auth.wrongNumber")} {t("auth.changeNumber")}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </AuthLayout>
  );
};
