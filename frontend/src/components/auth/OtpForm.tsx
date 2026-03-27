import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { otpSchema } from "../../utils/validators";
import { Button } from "../common/Button";
import { ErrorMessage } from "../common/ErrorMessage";
import { Input } from "../common/Input";

const schema = z.object({
  otp: otpSchema,
});

type OtpFormValues = z.infer<typeof schema>;

interface OtpFormProps {
  onSubmit: (values: OtpFormValues) => Promise<void>;
  loading?: boolean;
  error?: string;
}

export const OtpForm = ({ onSubmit, loading, error }: OtpFormProps) => {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OtpFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      otp: "",
    },
  });

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <Input
        label={t("auth.otpLabel")}
        inputMode="numeric"
        maxLength={6}
        placeholder={t("auth.otpPlaceholder")}
        error={errors.otp?.message}
        {...register("otp")}
      />

      <ErrorMessage message={error} />

      <Button type="submit" fullWidth loading={loading}>
        {t("auth.verifyOtp")}
      </Button>
    </form>
  );
};
