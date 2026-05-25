import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { LocationPicker } from "../../components/common/LocationPicker";
import { PageHeader } from "../../components/common/PageHeader";
import { Select } from "../../components/common/Select";
import { jobService } from "../../modules/job/job.service";
import { getErrorMessage } from "../../utils/helpers";

const schema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
  wage: z.coerce.number().positive("Wage must be greater than 0"),
  jobDate: z.string().min(1, "Job date is required"),
  requiredWorkers: z.coerce
    .number()
    .int("Workers must be a whole number")
    .positive("Required workers must be at least 1"),
  locationLine1: z.string().min(2, "Location detail is required"),
  city: z.string().min(2, "City is required"),
  landmark: z.string().min(2, "Landmark is required"),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
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
    watch,
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      category: "Construction",
      wage: undefined,
      jobDate: "",
      requiredWorkers: undefined,
      locationLine1: "",
      city: "",
      landmark: "",
      latitude: 20.5937, // India center
      longitude: 78.9629,
    },
  });

  const latitude = watch("latitude");
  const longitude = watch("longitude");
  const locationLine1 = watch("locationLine1");
  const city = watch("city");
  const landmark = watch("landmark");

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

  const handleLocationChange = (lat: number, lon: number) => {
    setValue("latitude", lat);
    setValue("longitude", lon);
  };

  const handleLocationLine1Change = (value: string) => {
    setValue("locationLine1", value, { shouldValidate: true });
  };

  const handleCityChange = (value: string) => {
    setValue("city", value, { shouldValidate: true });
  };

  const handleLandmarkChange = (value: string) => {
    setValue("landmark", value, { shouldValidate: true });
  };

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
        subtitle="Post a job with accurate location details"
      />

      <div className="rounded bg-brand-50 p-3 text-sm text-brand-700">
        📍 Set your job location on the map. Workers within 10km radius will see
        your job posting.
      </div>

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
          {...register("requiredWorkers")}
        />

        <Input
          label="Street / Area (First Part)"
          placeholder="e.g., Hingane Home Colony Road, Mavale vasti"
          error={errors.locationLine1?.message}
          {...register("locationLine1")}
        />

        <Input
          label="City"
          placeholder="e.g., Nagpur"
          error={errors.city?.message}
          {...register("city")}
        />

        <Input
          label="Landmark / Area"
          placeholder="e.g., Near Bus Stand"
          error={errors.landmark?.message}
          {...register("landmark")}
        />

        {/* Location Picker */}
        <LocationPicker
          latitude={latitude}
          longitude={longitude}
          locationLine1={locationLine1}
          city={city}
          landmarkArea={landmark}
          onLocationChange={handleLocationChange}
          onLocationLine1Change={handleLocationLine1Change}
          onCityChange={handleCityChange}
          onLandmarkAreaChange={handleLandmarkChange}
          error={errors.latitude?.message || errors.longitude?.message}
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
