import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { formatMobile } from "../../utils/formatters";
import { mobileSchema } from "../../utils/validators";
import { Button } from "../common/Button";
import { ErrorMessage } from "../common/ErrorMessage";
import { Input } from "../common/Input";

const schema = z.object({
  mobileNumber: mobileSchema,
});

type MobileFormValues = z.infer<typeof schema>;

interface MobileNumberFormProps {
  onSubmit: (values: MobileFormValues) => Promise<void>;
  loading?: boolean;
  error?: string;
}

export const MobileNumberForm = ({
  onSubmit,
  loading,
  error,
}: MobileNumberFormProps) => {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<MobileFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      mobileNumber: "",
    },
  });

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <Input
        label={t("auth.mobileLabel")}
        inputMode="numeric"
        maxLength={10}
        placeholder={t("auth.mobilePlaceholder")}
        error={errors.mobileNumber?.message}
        {...register("mobileNumber", {
          onChange: (event) => {
            setValue("mobileNumber", formatMobile(event.target.value));
          },
        })}
      />

      <ErrorMessage message={error} />

      <Button type="submit" fullWidth loading={loading}>
        {t("auth.getOtp")}
      </Button>
    </form>
  );
};
