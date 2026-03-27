import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { Button } from "../common/Button";
import { ErrorMessage } from "../common/ErrorMessage";
import { Input } from "../common/Input";
import { Select } from "../common/Select";

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name"),
  age: z.coerce.number().int().min(18, "Age must be 18+"),
  area: z.string().trim().min(2, "Please enter your area"),
  workType: z.string().trim().min(1, "Please select work type"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
});

type WorkerValues = z.infer<typeof schema>;

interface WorkerRegistrationFormProps {
  onSubmit: (values: WorkerValues) => Promise<void>;
  loading?: boolean;
  error?: string;
}

export const WorkerRegistrationForm = ({
  onSubmit,
  loading,
  error,
}: WorkerRegistrationFormProps) => {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WorkerValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      age: 18,
      area: "",
      workType: "HELPER",
      gender: "MALE",
    },
  });

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <Input
        label={t("auth.yourName")}
        placeholder={t("auth.yourNamePlaceholder")}
        error={errors.name?.message}
        {...register("name")}
      />

      <Input
        label={t("auth.age")}
        type="number"
        placeholder={t("auth.agePlaceholder")}
        error={errors.age?.message}
        {...register("age")}
      />

      <Input
        label={t("auth.areaLabel")}
        placeholder={t("auth.areaPlaceholder")}
        error={errors.area?.message}
        {...register("area")}
      />

      <Select
        label={t("auth.workType")}
        error={errors.workType?.message}
        options={[
          { label: t("auth.workHelper"), value: "HELPER" },
          { label: t("auth.workMason"), value: "MASON" },
          { label: t("auth.workPainter"), value: "PAINTER" },
          { label: t("auth.workCarpenter"), value: "CARPENTER" },
          { label: t("auth.workElectrician"), value: "ELECTRICIAN" },
          { label: t("auth.workPlumber"), value: "PLUMBER" },
          { label: t("auth.workOther"), value: "OTHER" },
        ]}
        {...register("workType")}
      />

      <Select
        label={t("auth.gender")}
        error={errors.gender?.message}
        options={[
          { label: t("auth.male"), value: "MALE" },
          { label: t("auth.female"), value: "FEMALE" },
          { label: t("auth.other"), value: "OTHER" },
        ]}
        {...register("gender")}
      />

      <ErrorMessage message={error} />

      <Button type="submit" fullWidth loading={loading}>
        {t("common.continue")}
      </Button>
    </form>
  );
};
