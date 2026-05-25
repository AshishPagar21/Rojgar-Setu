import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import { AuthLayout } from "../../components/layout/AuthLayout";
import { PageHeader } from "../../components/common/PageHeader";
import { RoleSelector } from "../../components/auth/RoleSelector";

type Props = {
  navigation: any;
  route: any;
};

export const SelectRoleScreen = ({ navigation, route }: Props) => {
  const { t } = useTranslation();
  const mobileNumber = route.params?.mobileNumber;
  const otp = route.params?.otp;

  useEffect(() => {
    if (!mobileNumber || !otp) {
      navigation.replace("Login");
    }
  }, [mobileNumber, otp, navigation]);

  const handleSelect = (role: "EMPLOYER" | "WORKER") => {
    if (!mobileNumber || !otp) return;

    if (role === "EMPLOYER") {
      navigation.navigate("EmployerRegister", { mobileNumber, otp });
      return;
    }

    navigation.navigate("WorkerRegister", { mobileNumber, otp });
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
            title={t("auth.selectRoleTitle")}
            subtitle={t("auth.selectRoleSubtitle")}
          />
          <RoleSelector onSelect={handleSelect} />
        </ScrollView>
      </KeyboardAvoidingView>
    </AuthLayout>
  );
};
