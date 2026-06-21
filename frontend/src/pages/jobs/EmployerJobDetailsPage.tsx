import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Button } from "../../components/common/Button";
import { PageHeader } from "../../components/common/PageHeader";
import { StatusBadge } from "../../components/common/StatusBadge";
import { RatingForm } from "../../components/common/RatingForm";
import { useAuth } from "../../hooks/useAuth";
import { attendanceService } from "../../modules/attendance/attendance.service";
import { disputeService } from "../../modules/dispute/dispute.service";
import { jobService } from "../../modules/job/job.service";
import { jobApplicationService } from "../../modules/jobApplication/jobApplication.service";
import { ratingService } from "../../modules/rating/rating.service";
import { socketService } from "../../services/socket.service";

const extractLocation = (description: string) => {
  const match = description.match(/Location:\s*([^\n]+)/i);
  return match?.[1]?.trim();
};

const cleanDescription = (description: string) =>
  description.replace(/\n*\n*Location:\s*[^\n]+/i, "").trim();

const getSelectedApplicants = (applicants: any[]) =>
  applicants.filter(
    (applicant) =>
      applicant.status === "SELECTED" || applicant.status === "COMPLETED",
  );

export const EmployerJobDetailsPage = () => {
  const { t } = useTranslation();
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState<any>(null);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [action, setAction] = useState<string>();
  const [ratings, setRatings] = useState<any[]>([]);
  const [ratingWorkerUserId, setRatingWorkerUserId] = useState<number | null>(null);
  const [ratingWorkerName, setRatingWorkerName] = useState<string>("");

  const refreshData = async (jobNumber: number) => {
    const jobData = await jobService.getJobById(jobNumber);
    setJob(jobData);

    try {
      const applicantData =
        await jobApplicationService.getJobApplicants(jobNumber);
      setApplicants(applicantData);
    } catch {
      setApplicants([]);
    }

    try {
      const attendanceData =
        await attendanceService.getJobAttendance(jobNumber);
      setAttendanceRecords(attendanceData);
    } catch {
      setAttendanceRecords([]);
    }

    try {
      const ratingsData = await ratingService.getJobRatings(jobNumber);
      setRatings(ratingsData || []);
    } catch {
      setRatings([]);
    }
  };

  useEffect(() => {
    const fetchJob = async () => {
      if (!jobId) return;
      try {
        setLoading(true);
        await refreshData(Number(jobId));
      } catch (err) {
        setError(t("jobDetails.failedToLoad"));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  useEffect(() => {
    const refreshForAttendanceEvents = async (payload: { jobId: number }) => {
      if (payload.jobId !== Number(jobId)) {
        return;
      }

      try {
        await refreshData(Number(jobId));
      } catch (err) {
        console.error(err);
      }
    };

    socketService.on("attendance:checked-in", refreshForAttendanceEvents);
    socketService.on("attendance:checked-out", refreshForAttendanceEvents);
    socketService.on("attendance:approved", refreshForAttendanceEvents);
    socketService.on("attendance:issue-reported", refreshForAttendanceEvents);

    return () => {
      socketService.off("attendance:checked-in", refreshForAttendanceEvents);
      socketService.off("attendance:checked-out", refreshForAttendanceEvents);
      socketService.off("attendance:approved", refreshForAttendanceEvents);
      socketService.off(
        "attendance:issue-reported",
        refreshForAttendanceEvents,
      );
    };
  }, [jobId]);

  const handleCancel = async () => {
    if (!jobId) return;
    try {
      setAction("canceling");
      await jobService.cancelJob(Number(jobId));
      navigate("/jobs/my");
    } catch (err) {
      setError(t("jobDetails.failedToCancel"));
      console.error(err);
    } finally {
      setAction(undefined);
    }
  };

  const handleComplete = async () => {
    if (!jobId) return;
    try {
      setAction("completing");
      await jobService.completeJob(Number(jobId));
      setJob({ ...job, status: "COMPLETED" });
    } catch (err) {
      setError(t("jobDetails.failedToComplete"));
      console.error(err);
    } finally {
      setAction(undefined);
    }
  };

  const handleApproveAttendance = async (attendanceId: number) => {
    if (!jobId) return;
    try {
      setAction(`approve-${attendanceId}`);
      await attendanceService.approveAttendance(attendanceId);
      await refreshData(Number(jobId));
    } catch (err) {
      setError(t("jobDetails.failedToApprove"));
      console.error(err);
    } finally {
      setAction(undefined);
    }
  };

  const handleReportIssue = async (attendanceId: number) => {
    if (!jobId) return;

    const reason = window.prompt(t("jobDetails.enterIssueReason"));
    if (!reason?.trim()) {
      return;
    }

    try {
      setAction(`issue-${attendanceId}`);
      await attendanceService.reportIssue(attendanceId, {
        reason: reason.trim(),
      });
      await refreshData(Number(jobId));
    } catch (err) {
      setError(t("jobDetails.failedToReportIssue"));
      console.error(err);
    } finally {
      setAction(undefined);
    }
  };

  const handleRaiseDispute = async (attendanceId: number) => {
    const reason = window.prompt(t("jobDetails.enterDisputeReason"));
    if (!reason?.trim()) {
      return;
    }

    const description = window.prompt(t("jobDetails.enterDisputeDescription")) ?? "";
    if (!description.trim()) {
      setError(t("jobDetails.disputeDescRequired"));
      return;
    }

    try {
      setAction(`dispute-${attendanceId}`);
      await disputeService.createDispute({
        jobId: Number(jobId),
        attendanceId,
        reason: reason.trim(),
        description: description.trim(),
      });
    } catch (err) {
      setError(t("jobDetails.failedToCreateDispute"));
      console.error(err);
    } finally {
      setAction(undefined);
    }
  };

  const selectedApplicants = getSelectedApplicants(applicants);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-600">{t("common.loading")}</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="rounded-panel bg-white p-5 text-center shadow-panel">
        <p className="text-slate-600">{t("jobDetails.jobNotFound")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={job.title} subtitle={t(`jobs.categories.${job.category}`, job.category) as string} />

      {error && (
        <div className="rounded bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="rounded-panel bg-white p-5 shadow-panel">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-slate-600">{t("jobDetails.status")}</p>
            <StatusBadge status={job.status} />
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-600">{t("jobDetails.wage")}</p>
            <p className="text-2xl font-bold text-slate-900">₹{job.wage}</p>
          </div>
        </div>

        <hr className="my-4" />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-600">{t("jobDetails.jobDate")}</p>
            <p className="text-sm font-medium text-slate-900">{job.jobDate}</p>
          </div>
          <div>
            <p className="text-xs text-slate-600">{t("jobDetails.requiredWorkers")}</p>
            <p className="text-sm font-medium text-slate-900">
              {job.requiredWorkers}
            </p>
          </div>
        </div>

        <hr className="my-4" />

        <div>
          <p className="text-sm font-medium text-slate-900">{t("jobDetails.description")}</p>
          <p className="mt-2 text-sm text-slate-700">
            {cleanDescription(job.description)}
          </p>
        </div>

        {extractLocation(job.description) && (
          <>
            <hr className="my-4" />
            <div>
              <p className="text-sm font-medium text-slate-900">{t("jobDetails.location")}</p>
              <p className="mt-2 text-sm text-slate-700">
                {extractLocation(job.description)}
              </p>
            </div>
          </>
        )}

        <hr className="my-4" />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-600">{t("jobDetails.applied")}</p>
            <p className="text-2xl font-bold text-slate-900">
              {applicants.filter((a) => a.status === "APPLIED").length}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-600">{t("jobDetails.selected")}</p>
            <p className="text-2xl font-bold text-slate-900">
              {applicants.filter((a) => a.status === "SELECTED" || a.status === "COMPLETED").length}
            </p>
          </div>
        </div>

        {selectedApplicants.length > 0 && (
          <>
            <hr className="my-4" />
            <div>
              <p className="mb-3 text-sm font-medium text-slate-900">
                {t("jobDetails.selectedWorkersAttendance")}
              </p>
              <div className="space-y-3">
                {selectedApplicants.map((selectedApplicant) => {
                  const attendance = attendanceRecords.find(
                    (record) => record.workerId === selectedApplicant.workerId,
                  );
                  const payment = job.payments?.find(
                     (p: any) => p.workerId === selectedApplicant.workerId,
                  );
                  const isPaid = payment?.status === "COMPLETED";
                  const existingRating = ratings.find(
                    (r) =>
                      r.fromUserId === user?.id &&
                      r.toUserId === selectedApplicant.worker?.userId,
                  );
                  const status = attendance?.status ?? selectedApplicant.status;
                  const canReview = attendance?.status === "PENDING_REVIEW";
                  const canRaiseDispute =
                    attendance?.status === "ISSUE_REPORTED";

                  return (
                    <div
                      key={selectedApplicant.id}
                      className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <p className="font-medium text-slate-900">
                            {attendance?.worker?.name ??
                              selectedApplicant.worker?.name ??
                              t("jobDetails.worker")}
                          </p>
                          <p className="text-sm text-slate-605">
                            {t("jobDetails.reliability", { score: selectedApplicant.worker?.reliabilityScore ?? 0 })}
                          </p>
                          <p className="text-sm text-slate-605">
                            {t("jobDetails.checkIn", { time: attendance?.checkInTime ? new Date(attendance.checkInTime).toLocaleTimeString() : t("jobDetails.notMarked") })}
                          </p>
                          <p className="text-sm text-slate-650">
                            {t("jobDetails.checkOut", { time: attendance?.checkOutTime ? new Date(attendance.checkOutTime).toLocaleTimeString() : t("jobDetails.notMarked") })}
                          </p>
                          <p className="text-sm text-slate-650">
                            {t("jobDetails.hoursWorked", { hours: attendance?.totalHours ?? "-" })}
                          </p>
                        </div>
                        <StatusBadge status={status} />
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          onClick={() =>
                            attendance && handleApproveAttendance(attendance.id)
                          }
                          disabled={!canReview}
                          loading={
                            attendance
                              ? action === `approve-${attendance.id}`
                              : false
                          }
                        >
                          {t("jobDetails.approve")}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() =>
                            attendance && handleReportIssue(attendance.id)
                          }
                          disabled={!canReview}
                          loading={
                            attendance
                              ? action === `issue-${attendance.id}`
                              : false
                          }
                        >
                          {t("jobDetails.reportIssue")}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() =>
                            attendance && handleRaiseDispute(attendance.id)
                          }
                          disabled={!canRaiseDispute}
                          loading={
                            attendance
                              ? action === `dispute-${attendance.id}`
                              : false
                          }
                        >
                          {t("jobDetails.raiseDispute")}
                        </Button>
                      </div>
                      {job.status === "COMPLETED" && (
                        <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3 text-sm">
                          <span className="text-slate-500 font-medium">{t("jobDetails.feedback")}</span>
                          {existingRating ? (
                            <span className="font-semibold text-emerald-650">
                              {t("jobDetails.rated", { value: existingRating.ratingValue })}
                            </span>
                          ) : isPaid ? (
                            <Button
                              variant="outline"
                              onClick={() => {
                                setRatingWorkerUserId(selectedApplicant.worker.userId);
                                setRatingWorkerName(selectedApplicant.worker.name);
                              }}
                              className="text-xs py-1 px-3 border-brand-200 text-brand-605 hover:bg-brand-50"
                            >
                              {t("jobDetails.rateWorker")}
                            </Button>
                          ) : (
                            <span className="text-slate-400 italic">
                              {t("jobDetails.completePaymentToRate")}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="space-y-3">
        {job.status === "OPEN" && (
          <>
            <Button
              fullWidth
              onClick={() => navigate(`/jobs/${jobId}/applicants`)}
              className="bg-green-600 hover:bg-green-700"
            >
              {t("jobDetails.viewApplicants", { count: applicants.length })}
            </Button>
            <Button
              fullWidth
              variant="outline"
              onClick={handleCancel}
              loading={action === "canceling"}
            >
              {t("jobDetails.cancelJob")}
            </Button>
          </>
        )}

        {job.status === "ASSIGNED" && (
          <>
            <Button
              fullWidth
              onClick={() => navigate(`/jobs/${jobId}/payments`)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {t("jobDetails.viewPayments")}
            </Button>
            <Button
              fullWidth
              variant="outline"
              onClick={handleComplete}
              loading={action === "completing"}
            >
              {t("jobDetails.markComplete")}
            </Button>
          </>
        )}

        {job.status === "COMPLETED" && (
          <Button fullWidth variant="secondary" disabled>
            {t("jobDetails.jobCompleted")}
          </Button>
        )}
      </div>

      {ratingWorkerUserId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{t("jobDetails.rateWorker")}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{t("jobDetails.ratingFor", { name: ratingWorkerName })}</p>
              </div>
              <button
                onClick={() => {
                  setRatingWorkerUserId(null);
                }}
                className="text-slate-400 hover:text-slate-600 text-xl font-semibold"
              >
                ✕
              </button>
            </div>
            <RatingForm
              jobId={Number(jobId)}
              toUserId={ratingWorkerUserId!}
              onSuccess={() => {
                setRatingWorkerUserId(null);
                if (jobId) refreshData(Number(jobId));
              }}
              onCancel={() => {
                setRatingWorkerUserId(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
