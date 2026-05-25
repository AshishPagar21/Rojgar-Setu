import { useState } from "react";
import { View } from "react-native";
import { useTranslation } from "react-i18next";
import { Button } from "../common/Button";
import { ErrorMessage } from "../common/ErrorMessage";
import { Input } from "../common/Input";
import { otpSchema } from "../../utils/validators";

interface Props {
  onSubmit: (values: { otp: string }) => Promise<void>;
  loading?: boolean;
  error?: string;
}

export const OtpForm = ({ onSubmit, loading, error }: Props) => {
  const { t } = useTranslation();
  const [otp, setOtp] = useState("");
  const [fieldError, setFieldError] = useState<string>();

  const handleSubmit = async () => {
    const parsed = otpSchema.safeParse(otp);
    if (!parsed.success) {
      setFieldError(parsed.error.issues[0]?.message || t("validation.otp"));
      return;
    }

    setFieldError(undefined);
    await onSubmit({ otp });
  };

  return (
    <View style={{ gap: 16 }}>
      <Input
        label={t("auth.otpLabel")}
        placeholder={t("auth.otpPlaceholder")}
        keyboardType="number-pad"
        maxLength={6}
        value={otp}
        onChangeText={(text) => {
          setOtp(text.replace(/\D/g, "").slice(0, 6));
          if (fieldError) setFieldError(undefined);
        }}
        error={fieldError}
      />

      <ErrorMessage message={error} />

      <Button fullWidth loading={loading} onPress={handleSubmit}>
        {t("auth.verifyOtp")}
      </Button>
    </View>
  );
};
