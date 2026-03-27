import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { Button } from "../common/Button";
import { ErrorMessage } from "../common/ErrorMessage";
import { Input } from "../common/Input";

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name"),
  area: z.string().trim().min(2, "Please enter your area"),
});

type EmployerValues = z.infer<typeof schema>;

interface EmployerRegistrationFormProps {
  onSubmit: (values: EmployerValues) => Promise<void>;
  loading?: boolean;
  error?: string;
}

export const EmployerRegistrationForm = ({
  onSubmit,
  loading,
  error,
}: EmployerRegistrationFormProps) => {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmployerValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
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
        label={t("auth.areaLabel")}
        placeholder={t("auth.areaPlaceholder")}
        error={errors.area?.message}
        {...register("area")}
      />

      <ErrorMessage message={error} />

      <Button type="submit" fullWidth loading={loading}>
        {t("common.continue")}
      </Button>
    </form>
  );
};
