import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
        label="OTP"
        inputMode="numeric"
        maxLength={6}
        placeholder="Enter 6 digit OTP"
        error={errors.otp?.message}
        {...register("otp")}
      />

      <ErrorMessage message={error} />

      <Button type="submit" fullWidth loading={loading}>
        Verify OTP
      </Button>
    </form>
  );
};
