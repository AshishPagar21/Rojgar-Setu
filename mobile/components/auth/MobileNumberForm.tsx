import { useState } from "react";
import { View } from "react-native";
import { useTranslation } from "react-i18next";
import { Button } from "../common/Button";
import { ErrorMessage } from "../common/ErrorMessage";
import { Input } from "../common/Input";
import { formatMobile } from "../../utils/formatters";
import { isValidMobile } from "../../utils/validators";

interface Props {
  onSubmit: (values: { mobileNumber: string }) => Promise<void>;
  loading?: boolean;
  error?: string;
}

export const MobileNumberForm = ({ onSubmit, loading, error }: Props) => {
  const { t } = useTranslation();
  const [mobileNumber, setMobileNumber] = useState("");
  const [fieldError, setFieldError] = useState<string>();

  const handleSubmit = async () => {
    const cleaned = formatMobile(mobileNumber);
    if (!isValidMobile(cleaned)) {
      setFieldError(t("validation.mobileNumber"));
      return;
    }

    setFieldError(undefined);
    await onSubmit({ mobileNumber: cleaned });
  };

  return (
    <View style={{ gap: 16 }}>
      <Input
        label={t("auth.mobileLabel")}
        placeholder={t("auth.mobilePlaceholder")}
        keyboardType="number-pad"
        maxLength={10}
        value={mobileNumber}
        onChangeText={(text) => {
          setMobileNumber(formatMobile(text));
          if (fieldError) setFieldError(undefined);
        }}
        error={fieldError}
      />

      <ErrorMessage message={error} />

      <Button fullWidth loading={loading} onPress={handleSubmit}>
        {t("auth.getOtp")}
      </Button>
    </View>
  );
};
