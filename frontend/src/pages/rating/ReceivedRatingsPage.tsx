import { useEffect, useState } from "react";

import { PageHeader } from "../../components/common/PageHeader";
import { ratingService } from "../../modules/rating/rating.service";

export const ReceivedRatingsPage = () => {
  const [ratings, setRatings] = useState<any[]>([]);
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

  const renderStars = (rating: number) => {
    return "⭐".repeat(rating) + "☆".repeat(5 - rating);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Received Ratings" subtitle="How others rate you" />

      {error && (
        <div className="rounded bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Average Rating */}
      {ratings.length > 0 && (
        <div className="rounded-panel bg-yellow-50 p-4 shadow-panel text-center">
          <p className="text-2xl font-bold text-yellow-600">{averageRating}</p>
          <p className="text-sm text-yellow-900 mt-1">
            {renderStars(Math.round(Number(averageRating)))}
          </p>
          <p className="text-xs text-yellow-700 mt-2">
            Based on {ratings.length} rating(s)
          </p>
        </div>
      )}

      {/* Ratings List */}
      {ratings.length === 0 ? (
        <div className="rounded-panel bg-white p-8 text-center shadow-panel">
          <p className="text-slate-600">No ratings yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {ratings.map((rating) => (
            <div
              key={rating.id}
              className="rounded-panel bg-white p-4 shadow-panel"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-slate-900">
                    {rating.fromUser.role === "EMPLOYER"
                      ? "Employer"
                      : "Worker"}
                  </p>
                  <p className="text-xs text-slate-600">{rating.job?.title}</p>
                </div>
                <p className="text-xl">{renderStars(rating.ratingValue)}</p>
              </div>
              {rating.reviewText && (
                <p className="mt-3 text-sm text-slate-700">
                  "{rating.reviewText}"
                </p>
              )}
              <p className="mt-2 text-xs text-slate-500">
                {new Date(rating.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
