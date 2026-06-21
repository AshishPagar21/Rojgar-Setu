import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { LocationPicker } from "../../components/common/LocationPicker";
import { PageHeader } from "../../components/common/PageHeader";
import { Select } from "../../components/common/Select";
import { jobService } from "../../modules/job/job.service";
import { getErrorMessage } from "../../utils/helpers";

const schema = z
  .object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters"),
    category: z.string().min(1, "Category is required"),
    wage: z.coerce.number().positive("Wage must be greater than 0"),
    jobDate: z.string().min(1, "Job date is required"),

    expectedStartTime: z.string().min(1, "Start time is required"),
    expectedEndTime: z.string().min(1, "End time is required"),

    requiredWorkers: z.coerce
      .number()
      .int("Workers must be a whole number")
      .positive("Required workers must be at least 1"),

    locationLine1: z.string().min(2, "Location detail is required"),
    city: z.string().min(2, "City is required"),
    landmark: z.string().min(2, "Landmark is required"),

    latitude: z.coerce.number().min(-90).max(90),
    longitude: z.coerce.number().min(-180).max(180),
  })
  .refine((data) => data.expectedEndTime > data.expectedStartTime, {
    message: "End time must be after start time",
    path: ["expectedEndTime"],
  });

type FormValues = z.infer<typeof schema>;

export const CreateJobPage = () => {
  const { t } = useTranslation();
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

      expectedStartTime: "",
      expectedEndTime: "",

      requiredWorkers: undefined,
      locationLine1: "",
      city: "",
      landmark: "",
      latitude: 20.5937,
      longitude: 78.9629,
    },
  });

  const latitude = watch("latitude");
  const longitude = watch("longitude");
  const locationLine1 = watch("locationLine1");
  const city = watch("city");
  const landmark = watch("landmark");

  const categories = [
    { label: t("jobs.categories.Construction"), value: "Construction" },
    { label: t("jobs.categories.Repairs"), value: "Repairs" },
    { label: t("jobs.categories.Cleaning"), value: "Cleaning" },
    { label: t("jobs.categories.Plumbing"), value: "Plumbing" },
    { label: t("jobs.categories.Electrical"), value: "Electrical" },
    { label: t("jobs.categories.Carpentry"), value: "Carpentry" },
    { label: t("jobs.categories.Painting"), value: "Painting" },
    { label: t("jobs.categories.Masonry"), value: "Masonry" },
    { label: t("jobs.categories.Other"), value: "Other" },
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

  const calculateHours = (startTime: string, endTime: string): number => {
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    const start = startHour + startMinute / 60;
    const end = endHour + endMinute / 60;

    return Number((end - start).toFixed(2));
  };

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    setError(undefined);

    try {
      const expectedWorkingHours = calculateHours(
        values.expectedStartTime,
        values.expectedEndTime,
      );

      console.log("Submitting Job:", {
        ...values,
        expectedWorkingHours,
      });

      await jobService.createJob({
        ...values,
        expectedWorkingHours,
      });

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
        title={t("jobs.createNewJob")}
        subtitle={t("jobs.postJobWithLocation")}
      />

      <div className="rounded bg-brand-50 p-3 text-sm text-brand-700">
        {t("jobs.setJobLocationMap")}
      </div>

      {error && (
        <div className="rounded bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Input
          label={t("jobs.jobTitle")}
          placeholder={t("jobs.jobTitlePlaceholder")}
          error={errors.title?.message}
          {...register("title")}
        />

        <label className="block w-full">
          <span className="mb-1 block text-sm font-medium text-slate-700">
            {t("jobs.description")}
          </span>
          <textarea
            className="h-24 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-base outline-none focus:border-brand-600 focus:bg-white focus:ring-2 focus:ring-brand-100"
            placeholder={t("jobs.descriptionPlaceholder")}
            {...register("description")}
          />
          {errors.description && (
            <p className="mt-1 text-xs text-red-600">
              {errors.description.message}
            </p>
          )}
        </label>

        <Select
          label={t("jobs.category")}
          options={categories}
          error={errors.category?.message}
          {...register("category")}
        />

        <Input
          label={t("jobs.wage")}
          type="number"
          placeholder={t("jobs.wagePlaceholder")}
          error={errors.wage?.message}
          {...register("wage", { valueAsNumber: true })}
        />

        <Input
          label={t("jobs.jobDate")}
          type="date"
          error={errors.jobDate?.message}
          {...register("jobDate")}
        />

        <Input
          label={t("jobs.expectedStartTime")}
          type="time"
          error={errors.expectedStartTime?.message}
          {...register("expectedStartTime")}
        />

        <Input
          label={t("jobs.expectedEndTime")}
          type="time"
          error={errors.expectedEndTime?.message}
          {...register("expectedEndTime")}
        />

        <Input
          label={t("jobs.requiredWorkers")}
          type="number"
          placeholder={t("jobs.requiredWorkersPlaceholder")}
          error={errors.requiredWorkers?.message}
          {...register("requiredWorkers")}
        />

        <Input
          label={t("jobs.streetArea")}
          placeholder={t("jobs.streetAreaPlaceholder")}
          error={errors.locationLine1?.message}
          {...register("locationLine1")}
        />

        <Input
          label={t("jobs.city")}
          placeholder={t("jobs.cityPlaceholder")}
          error={errors.city?.message}
          {...register("city")}
        />

        <Input
          label={t("jobs.landmark")}
          placeholder={t("jobs.landmarkPlaceholder")}
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
            {t("jobs.cancel")}
          </Button>
          <Button type="submit" fullWidth loading={loading}>
            {t("jobs.createJobBtn")}
          </Button>
        </div>
      </form>
    </div>
  );
};
