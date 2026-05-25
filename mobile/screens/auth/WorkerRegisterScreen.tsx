import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import { AuthLayout } from "../../components/layout/AuthLayout";
import { PageHeader } from "../../components/common/PageHeader";
import { WorkerRegistrationForm } from "../../components/auth/WorkerRegistrationForm";
import { authService } from "../../modules/auth/auth.service";
import { useAuth } from "../../hooks/useAuth";
import { getErrorMessage } from "../../utils/helpers";

type Props = {
  navigation: any;
  route: any;
};

export const WorkerRegisterScreen = ({ navigation, route }: Props) => {
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

  const handleSubmit = async (values: {
    name: string;
    age: number;
    area: string;
    workType: string;
    gender: "MALE" | "FEMALE" | "OTHER";
  }) => {
    if (!mobileNumber || !otp) return;

    setLoading(true);
    setError(undefined);

    try {
      const result = await authService.verifyOtp({
        mobileNumber,
        otp,
        role: "WORKER",
        name: values.name,
        age: values.age,
        gender: values.gender,
        area: values.area,
        workType: values.workType,
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
            title={t("auth.workerRegisterTitle")}
            subtitle={t("auth.workerRegisterSubtitle")}
          />
          <WorkerRegistrationForm
            onSubmit={handleSubmit}
            loading={loading}
            error={error}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </AuthLayout>
  );
};
