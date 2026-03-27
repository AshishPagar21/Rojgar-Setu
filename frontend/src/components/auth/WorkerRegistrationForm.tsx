import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "../common/Button";
import { ErrorMessage } from "../common/ErrorMessage";
import { Input } from "../common/Input";
import { Select } from "../common/Select";

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name"),
  age: z.coerce.number().int().min(18, "Age must be 18+"),
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
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WorkerValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      age: 18,
      gender: "MALE",
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

      <Input
        label="Age"
        type="number"
        placeholder="Enter age"
        error={errors.age?.message}
        {...register("age")}
      />

      <Select
        label="Gender"
        error={errors.gender?.message}
        options={[
          { label: "Male", value: "MALE" },
          { label: "Female", value: "FEMALE" },
          { label: "Other", value: "OTHER" },
        ]}
        {...register("gender")}
      />

      <ErrorMessage message={error} />

      <Button type="submit" fullWidth loading={loading}>
        Continue
      </Button>
    </form>
  );
};
