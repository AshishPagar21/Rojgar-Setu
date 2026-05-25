import { useState } from "react";
import { View } from "react-native";
import { useTranslation } from "react-i18next";
import { Button } from "../common/Button";
import { ErrorMessage } from "../common/ErrorMessage";
import { Input } from "../common/Input";
import { areaSchema, nameSchema } from "../../utils/validators";

interface Props {
  onSubmit: (values: { name: string; area: string }) => Promise<void>;
  loading?: boolean;
  error?: string;
}

export const EmployerRegistrationForm = ({
  onSubmit,
  loading,
  error,
}: Props) => {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [fieldError, setFieldError] = useState<string>();

  const handleSubmit = async () => {
    const nameResult = nameSchema.safeParse(name);
    if (!nameResult.success) {
      setFieldError(nameResult.error.issues[0]?.message || t("validation.name"));
      return;
    }

    const areaResult = areaSchema.safeParse(area);
    if (!areaResult.success) {
      setFieldError(areaResult.error.issues[0]?.message || t("validation.area"));
      return;
    }

    setFieldError(undefined);
    await onSubmit({ name: name.trim(), area: area.trim() });
  };

  return (
    <View style={{ gap: 16 }}>
      <Input
        label={t("auth.yourName")}
        placeholder={t("auth.yourNamePlaceholder")}
        value={name}
        onChangeText={setName}
        error={fieldError}
      />
      <Input
        label={t("auth.areaLabel")}
        placeholder={t("auth.areaPlaceholder")}
        value={area}
        onChangeText={setArea}
        error={fieldError && area ? undefined : fieldError}
      />
      <ErrorMessage message={error} />
      <Button fullWidth loading={loading} onPress={handleSubmit}>
        {t("common.continue")}
      </Button>
    </View>
  );
};
