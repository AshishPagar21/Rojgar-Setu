import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "./Button";
import { ratingService } from "../../modules/rating/rating.service";
import { getErrorMessage } from "../../utils/helpers";

const schema = z.object({
  ratingValue: z.number().min(1).max(5),
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const {
    register,
    handleSubmit,
    watch,
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
          Rating
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <label key={value} className="cursor-pointer">
              <input
                type="radio"
                value={value}
                {...register("ratingValue", { valueAsNumber: true })}
                className="sr-only"
              />
              <span className="text-4xl">
                {value <= selectedRating ? "?" : "?"}
              </span>
            </label>
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
          Review (Optional)
        </span>
        <textarea
          className="h-20 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-base outline-none focus:border-brand-600 focus:bg-white focus:ring-2 focus:ring-brand-100"
          placeholder="Share your experience..."
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
          Cancel
        </Button>
        <Button type="submit" fullWidth loading={loading}>
          Submit Rating
        </Button>
      </div>
    </form>
  );
};
