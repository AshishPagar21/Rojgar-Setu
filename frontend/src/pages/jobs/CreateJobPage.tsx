import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { PageHeader } from "../../components/common/PageHeader";
import { Select } from "../../components/common/Select";
import { jobService } from "../../modules/job/job.service";
import { getErrorMessage } from "../../utils/helpers";

const schema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
  wage: z.number().positive("Wage is required"),
  jobDate: z.string().min(1, "Job date is required"),
  requiredWorkers: z.number().positive("Required workers is required"),
  latitude: z.number(),
  longitude: z.number(),
});

type FormValues = z.infer<typeof schema>;

export const CreateJobPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      category: "Construction",
      wage: 0,
      jobDate: "",
      requiredWorkers: 0,
      latitude: 0,
      longitude: 0,
    },
  });

  const categories = [
    { label: "Construction", value: "Construction" },
    { label: "Repairs", value: "Repairs" },
    { label: "Cleaning", value: "Cleaning" },
    { label: "Plumbing", value: "Plumbing" },
    { label: "Electrical", value: "Electrical" },
    { label: "Carpentry", value: "Carpentry" },
    { label: "Painting", value: "Painting" },
    { label: "Masonry", value: "Masonry" },
    { label: "Other", value: "Other" },
  ];

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    setError(undefined);

    try {
      await jobService.createJob(values);
      navigate("/jobs/my");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create New Job"
        subtitle="Post a job and find workers"
      />

      {error && (
        <div className="rounded bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Input
          label="Job Title"
          placeholder="e.g., House Painting"
          error={errors.title?.message}
          {...register("title")}
        />

        <label className="block w-full">
          <span className="mb-1 block text-sm font-medium text-slate-700">
            Description
          </span>
          <textarea
            className="h-24 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-base outline-none focus:border-brand-600 focus:bg-white focus:ring-2 focus:ring-brand-100"
            placeholder="Describe the job in detail..."
            {...register("description")}
          />
          {errors.description && (
            <p className="mt-1 text-xs text-red-600">
              {errors.description.message}
            </p>
          )}
        </label>

        <Select
          label="Category"
          options={categories}
          error={errors.category?.message}
          {...register("category")}
        />

        <Input
          label="Wage (₹)"
          type="number"
          placeholder="e.g., 500"
          error={errors.wage?.message}
          {...register("wage", { valueAsNumber: true })}
        />

        <Input
          label="Job Date"
          type="date"
          error={errors.jobDate?.message}
          {...register("jobDate")}
        />

        <Input
          label="Required Workers"
          type="number"
          placeholder="e.g., 3"
          error={errors.requiredWorkers?.message}
          {...register("requiredWorkers", { valueAsNumber: true })}
        />

        <Input
          label="Latitude"
          type="number"
          step="0.000001"
          placeholder="e.g., 28.7041"
          error={errors.latitude?.message}
          {...register("latitude", { valueAsNumber: true })}
        />

        <Input
          label="Longitude"
          type="number"
          step="0.000001"
          placeholder="e.g., 77.1025"
          error={errors.longitude?.message}
          {...register("longitude", { valueAsNumber: true })}
        />

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            fullWidth
            onClick={() => navigate("/jobs/my")}
          >
            Cancel
          </Button>
          <Button type="submit" fullWidth loading={loading}>
            Create Job
          </Button>
        </div>
      </form>
    </div>
  );
};
