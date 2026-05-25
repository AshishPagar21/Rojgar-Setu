import { useState } from "react";
import { View } from "react-native";
import { useTranslation } from "react-i18next";
import { Button } from "../common/Button";
import { ErrorMessage } from "../common/ErrorMessage";
import { Input } from "../common/Input";
import { Select } from "../common/Select";
import { ageSchema, areaSchema, nameSchema } from "../../utils/validators";

interface Props {
  onSubmit: (values: {
    name: string;
    age: number;
    area: string;
    workType: string;
    gender: "MALE" | "FEMALE" | "OTHER";
  }) => Promise<void>;
  loading?: boolean;
  error?: string;
}

export const WorkerRegistrationForm = ({ onSubmit, loading, error }: Props) => {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [age, setAge] = useState("18");
  const [area, setArea] = useState("");
  const [workType, setWorkType] = useState("HELPER");
  const [gender, setGender] = useState<"MALE" | "FEMALE" | "OTHER">("MALE");
  const [fieldError, setFieldError] = useState<string>();

  const handleSubmit = async () => {
    const nameResult = nameSchema.safeParse(name);
    if (!nameResult.success) {
      setFieldError(nameResult.error.issues[0]?.message || t("validation.name"));
      return;
    }

    const ageResult = ageSchema.safeParse(age);
    if (!ageResult.success) {
      setFieldError(ageResult.error.issues[0]?.message || t("validation.age"));
      return;
    }

    const areaResult = areaSchema.safeParse(area);
    if (!areaResult.success) {
      setFieldError(areaResult.error.issues[0]?.message || t("validation.area"));
      return;
    }

    setFieldError(undefined);
    await onSubmit({
      name: name.trim(),
      age: Number(age),
      area: area.trim(),
      workType,
      gender,
    });
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
        label={t("auth.age")}
        placeholder={t("auth.agePlaceholder")}
        keyboardType="number-pad"
        value={age}
        onChangeText={(text) => setAge(text.replace(/\D/g, "").slice(0, 3))}
        error={fieldError}
      />
      <Input
        label={t("auth.areaLabel")}
        placeholder={t("auth.areaPlaceholder")}
        value={area}
        onChangeText={setArea}
        error={fieldError && area ? undefined : fieldError}
      />
      <Select
        label={t("auth.workType")}
        selectedValue={workType}
        onValueChange={(value) => setWorkType(String(value))}
        options={[
          { label: t("auth.workHelper"), value: "HELPER" },
          { label: t("auth.workMason"), value: "MASON" },
          { label: t("auth.workPainter"), value: "PAINTER" },
          { label: t("auth.workCarpenter"), value: "CARPENTER" },
          { label: t("auth.workElectrician"), value: "ELECTRICIAN" },
          { label: t("auth.workPlumber"), value: "PLUMBER" },
          { label: t("auth.workOther"), value: "OTHER" },
        ]}
      />
      <Select
        label={t("auth.gender")}
        selectedValue={gender}
        onValueChange={(value) =>
          setGender(String(value) as "MALE" | "FEMALE" | "OTHER")
        }
        options={[
          { label: t("auth.male"), value: "MALE" },
          { label: t("auth.female"), value: "FEMALE" },
          { label: t("auth.other"), value: "OTHER" },
        ]}
      />
      <ErrorMessage message={error} />
      <Button fullWidth loading={loading} onPress={handleSubmit}>
        {t("common.continue")}
      </Button>
    </View>
  );
};
