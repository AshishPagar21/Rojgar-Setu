import { useEffect, useState } from "react";

import { PageHeader } from "../../components/common/PageHeader";
import { useAuth } from "../../hooks/useAuth";
import {
  ratingService,
  type ReceivedRating,
  type EmployerReceivedRating,
} from "../../modules/rating/rating.service";

export const ReceivedRatingsPage = () => {
  const { user } = useAuth();
  const isEmployer = user?.role === "EMPLOYER";
  const [ratings, setRatings] = useState<
    ReceivedRating[] | EmployerReceivedRating[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        setLoading(true);
        const data = await ratingService.getReceivedRatings();
        setRatings(data);
      } catch (err) {
        setError("Failed to load ratings");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRatings();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  const averageRating =
    ratings.length > 0
      ? (
          ratings.reduce((sum, r) => sum + r.ratingValue, 0) / ratings.length
        ).toFixed(1)
      : 0;

  const groupedRatings = ratings.reduce<
    Record<number, (ReceivedRating | EmployerReceivedRating)[]>
  >(
    (groups, rating) => {
      if (!groups[rating.jobId]) {
        groups[rating.jobId] = [];
      }

      groups[rating.jobId].push(rating);
      return groups;
    },
    {},
  );

  const renderStars = (rating: number) => {
    return "⭐".repeat(rating) + "☆".repeat(5 - rating);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEmployer ? "My Ratings" : "My Ratings"}
        subtitle={
          isEmployer
            ? "See job-wise feedback from workers"
            : "See job-wise feedback from employers"
        }
      />

      {error && (
        <div className="rounded bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Average Rating */}
      {ratings.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-panel bg-yellow-50 p-4 shadow-panel text-center">
            <p className="text-2xl font-bold text-yellow-600">{averageRating}</p>
            <p className="text-sm text-yellow-900 mt-1">
              {renderStars(Math.round(Number(averageRating)))}
            </p>
            <p className="text-xs text-yellow-700 mt-2">
              Overall average
            </p>
          </div>

          <div className="rounded-panel bg-white p-4 shadow-panel text-center">
            <p className="text-2xl font-bold text-slate-900">{ratings.length}</p>
            <p className="text-xs text-slate-600 mt-2">Total ratings</p>
          </div>

          <div className="rounded-panel bg-white p-4 shadow-panel text-center">
            <p className="text-2xl font-bold text-slate-900">
              {Object.keys(groupedRatings).length}
            </p>
            <p className="text-xs text-slate-600 mt-2">Jobs reviewed</p>
          </div>
        </div>
      )}

      {/* Ratings List */}
      {ratings.length === 0 ? (
        <div className="rounded-panel bg-white p-8 text-center shadow-panel">
          <p className="text-slate-600">No ratings yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.values(groupedRatings).map((jobRatings) => {
            const rating = jobRatings[0];

            return (
              <div
                key={rating.jobId}
                className="rounded-panel bg-white p-4 shadow-panel space-y-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-brand-600">
                      {rating.job.category}
                    </p>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {rating.job.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {rating.job.city}
                      {rating.job.landmark ? ` • ${rating.job.landmark}` : ""}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {new Date(rating.job.jobDate).toLocaleDateString()} • Wage ₹
                      {rating.job.wage}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-900">
                      {isEmployer
                        ? (rating as EmployerReceivedRating).fromUser.worker
                            ?.name ?? "Worker"
                        : (rating as ReceivedRating).fromUser.employer
                            ?.name ?? "Employer"}
                    </p>
                    <p className="text-xl">{renderStars(rating.ratingValue)}</p>
                  </div>
                </div>

                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    {isEmployer ? "Worker Review" : "Employer Review"}
                  </p>
                  <p className="mt-2 text-sm text-slate-700">
                    {rating.reviewText?.trim() || "No review was added."}
                  </p>
                </div>

                {jobRatings.length > 1 && (
                  <p className="text-xs text-slate-500">
                    {jobRatings.length} ratings recorded for this job.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
