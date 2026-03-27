import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "../common/Button";
import { ErrorMessage } from "../common/ErrorMessage";
import { Input } from "../common/Input";

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name"),
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
        label="Your Name"
        placeholder="Enter your name"
        error={errors.name?.message}
        {...register("name")}
      />

      <ErrorMessage message={error} />

      <Button type="submit" fullWidth loading={loading}>
        Continue
      </Button>
    </form>
  );
};
