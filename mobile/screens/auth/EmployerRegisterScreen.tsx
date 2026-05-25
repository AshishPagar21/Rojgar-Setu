import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import { AuthLayout } from "../../components/layout/AuthLayout";
import { PageHeader } from "../../components/common/PageHeader";
import { EmployerRegistrationForm } from "../../components/auth/EmployerRegistrationForm";
import { authService } from "../../modules/auth/auth.service";
import { useAuth } from "../../hooks/useAuth";
import { getErrorMessage } from "../../utils/helpers";

type Props = {
  navigation: any;
  route: any;
};

export const EmployerRegisterScreen = ({ navigation, route }: Props) => {
  const { t } = useTranslation();
  const { setAuthData } = useAuth();
  const mobileNumber = route.params?.mobileNumber;
  const otp = route.params?.otp;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!mobileNumber || !otp) {
      navigation.replace("Login");
    }
  }, [mobileNumber, otp, navigation]);

  const handleSubmit = async (values: { name: string; area: string }) => {
    if (!mobileNumber || !otp) return;

    setLoading(true);
    setError(undefined);

    try {
      const result = await authService.verifyOtp({
        mobileNumber,
        otp,
        role: "EMPLOYER",
        name: values.name,
        area: values.area,
      });

      await setAuthData({
        token: result.token,
        user: result.user,
        profile: result.profile,
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (!mobileNumber || !otp) {
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
            title={t("auth.employerRegisterTitle")}
            subtitle={t("auth.employerRegisterSubtitle")}
          />
          <EmployerRegistrationForm
            onSubmit={handleSubmit}
            loading={loading}
            error={error}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </AuthLayout>
  );
};
