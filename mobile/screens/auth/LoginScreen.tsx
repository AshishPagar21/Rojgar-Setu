import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import { AuthLayout } from "../../components/layout/AuthLayout";
import { PageHeader } from "../../components/common/PageHeader";
import { MobileNumberForm } from "../../components/auth/MobileNumberForm";
import { authService } from "../../modules/auth/auth.service";
import { getErrorMessage } from "../../utils/helpers";

export const LoginScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const handleSubmit = async (values: { mobileNumber: string }) => {
    setLoading(true);
    setError(undefined);

    try {
      const result = await authService.sendOtp(values);

      navigation.navigate("VerifyOtp", {
        mobileNumber: result.data.mobileNumber,
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <PageHeader
            title={t("auth.loginTitle")}
            subtitle={t("auth.loginSubtitle")}
          />
          <MobileNumberForm
            onSubmit={handleSubmit}
            loading={loading}
            error={error}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </AuthLayout>
  );
};
