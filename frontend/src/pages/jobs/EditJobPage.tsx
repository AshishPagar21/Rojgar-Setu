import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
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

const cleanDescription = (description?: string | null) =>
  (description ?? "").replace(/\n*\n*Location:\s*[^\n]+/i, "").trim();

export const EditJobPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { jobId } = useParams<{ jobId: string }>();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
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

  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!jobId) return;
      try {
        setLoading(true);
        const job = await jobService.getJobById(Number(jobId));
        
        // Format date to YYYY-MM-DD for date input
        const dateObj = new Date(job.jobDate);
        const formattedDate = dateObj.toISOString().split("T")[0];

        reset({
          title: job.title,
          description: cleanDescription(job.description),
          category: job.category,
          wage: job.wage,
          jobDate: formattedDate,
          expectedStartTime: job.expectedStartTime,
          expectedEndTime: job.expectedEndTime,
          requiredWorkers: job.requiredWorkers,
          locationLine1: job.locationLine1 || "",
          city: job.city || "",
          landmark: job.landmark || "",
          latitude: job.latitude,
          longitude: job.longitude,
        });
      } catch (err) {
        setError(getErrorMessage(err));
        toast.error("Failed to load job details");
      } finally {
        setLoading(false);
      }
    };
    fetchJobDetails();
  }, [jobId, reset]);

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
    if (!jobId) return;
    setSubmitting(true);
    setError(undefined);

    try {
      const expectedWorkingHours = calculateHours(
        values.expectedStartTime,
        values.expectedEndTime,
      );

      await jobService.updateJob(Number(jobId), {
        ...values,
        expectedWorkingHours,
      });

      toast.success(t("jobs.jobUpdatedSuccess", "Job details updated successfully!"));
      navigate(`/jobs/${jobId}`);
    } catch (err) {
      setError(getErrorMessage(err));
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-brand-600"></div>
        <p className="text-sm font-medium text-slate-500">{t("common.loading")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("jobs.editJob", "Edit Job Details")}
        subtitle={t("jobs.editJobSubtitle", "Update your job post details and location")}
      />

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
            onClick={() => navigate(`/jobs/${jobId}`)}
          >
            {t("jobs.cancel")}
          </Button>
          <Button type="submit" fullWidth loading={submitting}>
            {t("jobs.saveChanges", "Save Changes")}
          </Button>
        </div>
      </form>
    </div>
  );
};
