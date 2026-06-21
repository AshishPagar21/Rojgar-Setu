import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { Button } from "./Button";
import { ratingService } from "../../modules/rating/rating.service";
import { getErrorMessage } from "../../utils/helpers";

const schema = z.object({
  ratingValue: z.coerce.number().min(1).max(5),
  reviewText: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface RatingFormProps {
  jobId: number;
  toUserId: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const RatingForm = ({
  jobId,
  toUserId,
  onSuccess,
  onCancel,
}: RatingFormProps) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      ratingValue: 5,
      reviewText: "",
    },
  });

  const selectedRating = watch("ratingValue");

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    setError(undefined);

    try {
      await ratingService.createRating({
        jobId,
        toUserId,
        ratingValue: values.ratingValue,
        reviewText: values.reviewText,
      });
      onSuccess?.();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {t("rating.ratingLabel")}
        </label>
        <div className="flex gap-2">
          <input
            type="hidden"
            {...register("ratingValue", { valueAsNumber: true })}
          />
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setValue("ratingValue", value, { shouldValidate: true })}
              className="text-4xl text-amber-500 hover:scale-110 active:scale-95 transition-transform focus:outline-none"
            >
              {value <= selectedRating ? "★" : "☆"}
            </button>
          ))}
        </div>
        {errors.ratingValue && (
          <p className="mt-1 text-xs text-red-600">
            {errors.ratingValue.message}
          </p>
        )}
      </div>

      <label className="block w-full">
        <span className="mb-1 block text-sm font-medium text-slate-700">
          {t("rating.reviewLabel")}
        </span>
        <textarea
          className="h-20 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-base outline-none focus:border-brand-600 focus:bg-white focus:ring-2 focus:ring-brand-100"
          placeholder={t("rating.reviewPlaceholder")}
          {...register("reviewText")}
        />
        {errors.reviewText && (
          <p className="mt-1 text-xs text-red-600">
            {errors.reviewText.message}
          </p>
        )}
      </label>

      {error && (
        <div className="rounded bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          fullWidth
          onClick={onCancel}
          disabled={loading}
        >
          {t("jobs.cancel")}
        </Button>
        <Button type="submit" fullWidth loading={loading}>
          {t("rating.submitRating")}
        </Button>
      </div>
    </form>
  );
};
