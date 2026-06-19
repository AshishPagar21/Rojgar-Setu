import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { ApplicantCard } from "../../../components/common/ApplicantCard";
import { Button } from "../../../components/common/Button";
import { PageHeader } from "../../../components/common/PageHeader";

import { ratingService } from "../../../modules/rating/rating.service";
import { getErrorMessage } from "../../../utils/helpers";

export const RatingsPage = () => {
    const { jobId } = useParams<{ jobId: string }>();

    const [workers, setWorkers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string>();

    const fetchWorkers = async () => {
        if (!jobId) {
            setError("Job id is missing");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(undefined);

            const data =
                await ratingService.getEligibleWorkersForRating(
                    Number(jobId),
                );

            setWorkers(data);
        } catch (err) {
            setError(getErrorMessage(err));
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkers();
    }, [jobId]);



    const [selectedWorkers, setSelectedWorkers] = useState<number[]>([]);
    const [showRatingForm, setShowRatingForm] = useState(false);

    const [ratings, setRatings] = useState<Record<number, number>>({});
    const [reviewTexts, setReviewTexts] = useState<Record<number, string>>({});

    const selectedWorkerApplications = workers.filter((application) =>
        selectedWorkers.includes(application.worker.id),
    );

    const handleToggleWorker = (workerId: number) => {
        setSelectedWorkers((prev) =>
            prev.includes(workerId)
                ? prev.filter((id) => id !== workerId)
                : [...prev, workerId],
        );
    };

    const handleSelectAll = () => {
        if (selectedWorkers.length === workers.length) {
            setSelectedWorkers([]);
        } else {
            setSelectedWorkers(
                workers.map((application) => application.worker.id),
            );
        }
    };

    const handleRatingChange = (workerId: number, rating: number) => {
        setRatings((prev) => ({
            ...prev,
            [workerId]: rating,
        }));
    };

    const handleReviewTextChange = (workerId: number, reviewText: string) => {
        setReviewTexts((prev) => ({
            ...prev,
            [workerId]: reviewText,
        }));
    };

    const handleSubmitRatings = async () => {
        const missingRating = selectedWorkers.find(
            (workerId) => !ratings[workerId],
        );

        if (missingRating) {
            setError("Please select a rating for every selected worker");
            return;
        }

        if (!jobId) {
            setError("Job id is missing");
            return;
        }

        try {
            setSubmitting(true);
            setError(undefined);

            await Promise.all(
                selectedWorkerApplications.map((application) =>
                    ratingService.createRating({
                        jobId: Number(jobId),
                        toUserId: application.worker.userId,
                        ratingValue: ratings[application.worker.id],
                        reviewText: reviewTexts[application.worker.id]?.trim()
                            ? reviewTexts[application.worker.id].trim()
                            : undefined,
                    }),
                ),
            );

            setSelectedWorkers([]);
            setRatings({});
            setReviewTexts({});
            setShowRatingForm(false);
            await fetchWorkers();
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setSubmitting(false);
        }
    };


    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <p className="text-slate-600">Loading...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Rate Workers"
                subtitle="Select workers and provide ratings"
            />

            {error && (
                <div className="rounded bg-red-50 p-3 text-sm text-red-600">
                    {error}
                </div>
            )}

            {/* Progress */}
            <div className="rounded-panel bg-blue-50 p-4 shadow-panel">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-900">
                        Selected Workers
                    </span>

                    <span className="text-sm font-bold text-blue-600">
                        {selectedWorkers.length} / {workers.length}
                    </span>
                </div>

                <div className="mt-2 h-2 rounded-full bg-blue-200">
                    <div
                        className="h-full rounded-full bg-blue-600 transition-all"
                        style={{
                            width: `${workers.length > 0 ? (selectedWorkers.length / workers.length) * 100 : 0}%`,
                        }}
                    />
                </div>
            </div>

            {/* Select All */}
            <div className="flex items-center justify-between rounded-panel bg-white p-4 shadow-panel">
                <span className="font-medium">Select All Workers</span>

                <input
                    type="checkbox"
                    checked={selectedWorkers.length === workers.length}
                    onChange={handleSelectAll}
                    className="h-5 w-5"
                />
            </div>

            {/* Workers */}
            <div className="space-y-3">
                {workers.map((application) => (
                    <ApplicantCard
                        key={application.worker.id}
                        id={application.worker.id}
                        name={application.worker.name}
                        age={application.worker.age}
                        gender={application.worker.gender}
                        rating={application.worker.rating ?? 0}
                        totalRatings={application.worker.totalRatings ?? 0}
                        totalJobsCompleted={
                            application.worker.totalJobsCompleted ?? 0
                        }
                        isSelected={selectedWorkers.includes(
                            application.worker.id,
                        )}
                        onToggleSelect={handleToggleWorker}
                    />
                ))}
            </div>

            {workers.length === 0 && !loading && (
                <div className="rounded-panel bg-white p-6 text-center shadow-panel">
                    <p className="text-slate-600">
                        No eligible workers are available for rating.
                    </p>
                </div>
            )}

            {/* Open Rating Form */}
            {!showRatingForm ? (
                <Button
                    fullWidth
                    disabled={selectedWorkers.length === 0}
                    onClick={() => setShowRatingForm(true)}
                >
                    Give Rating
                </Button>
            ) : (
                <div className="space-y-4 rounded-panel bg-white p-4 shadow-panel">
                    <h2 className="text-lg font-semibold">
                        Rate Selected Workers
                    </h2>

                    {selectedWorkers.map((workerId) => {
                        const worker = workers.find(
                            (application) =>
                                application.worker.id === workerId,
                        );

                        return (
                            <div
                                key={workerId}
                                className="space-y-3 border-b pb-3"
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <span className="font-medium">{worker?.name}</span>

                                    <select
                                        value={ratings[workerId] || ""}
                                        onChange={(e) =>
                                            handleRatingChange(
                                                workerId,
                                                Number(e.target.value)
                                            )
                                        }
                                        className="rounded border p-2"
                                    >
                                        <option value="">Select Rating</option>
                                        <option value={1}>⭐ 1</option>
                                        <option value={2}>⭐⭐ 2</option>
                                        <option value={3}>⭐⭐⭐ 3</option>
                                        <option value={4}>⭐⭐⭐⭐ 4</option>
                                        <option value={5}>⭐⭐⭐⭐⭐ 5</option>
                                    </select>
                                </div>

                                <textarea
                                    value={reviewTexts[workerId] || ""}
                                    onChange={(e) =>
                                        handleReviewTextChange(
                                            workerId,
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Add an optional review for this worker"
                                    className="min-h-24 w-full rounded border p-2 text-sm"
                                />
                            </div>
                        );
                    })}

                    <Button
                        fullWidth
                        onClick={handleSubmitRatings}
                        loading={submitting}
                    >
                        Submit Ratings
                    </Button>
                </div>
            )}
        </div>
    );
};