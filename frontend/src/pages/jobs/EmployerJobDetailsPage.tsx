import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import {
  CalendarDays,
  Clock,
  Users,
  Tag,
  MapPin,
  IndianRupee,
  AlertTriangle,
  Flag,
  Timer,
  LogIn,
  LogOut,
  SearchX,
  Send,
  CheckCircle2,
  CreditCard,
  FlagTriangleRight,
  Star,
  Loader2,
  X,
  ShieldCheck,
} from "lucide-react";

import { Button } from "../../components/common/Button";
import { DisputeFormModal } from "../../components/common/DisputeFormModal";
import { DisputeDetailsPanel } from "../../components/common/DisputeDetailsPanel";
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

const cleanDescription = (description: string) =>
  description.replace(/\n*\n*Location:\s*[^\n]+/i, "").trim();

const buildLocationDisplay = (job: any): string | null => {
  const parts = [job.locationLine1, job.city, job.landmark].filter(Boolean);
  if (parts.length > 0) return parts.join(", ");
  const match = (job.description ?? "").match(/Location:\s*([^\n]+)/i);
  return match?.[1]?.trim() ?? null;
};

const formatDate = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

const getSelectedApplicants = (applicants: any[]) =>
  applicants.filter((a) => a.status === "SELECTED" || a.status === "COMPLETED");

const InfoTile = ({
  icon,
  label,
  value,
  color = "indigo",
  colSpan2 = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  color?: "indigo" | "amber" | "slate" | "emerald";
  colSpan2?: boolean;
}) => {
  const colors = {
    indigo: {
      bg: "bg-indigo-50/50 border border-indigo-50/80",
      label: "text-indigo-500",
      value: "text-indigo-955",
      icon: "text-indigo-650",
    },
    amber: {
      bg: "bg-amber-50/50 border border-amber-50/80",
      label: "text-amber-600",
      value: "text-amber-955",
      icon: "text-amber-650",
    },
    slate: {
      bg: "bg-slate-50/80 border border-slate-100",
      label: "text-slate-500",
      value: "text-slate-800",
      icon: "text-slate-400",
    },
    emerald: {
      bg: "bg-emerald-50/50 border border-emerald-100/80",
      label: "text-emerald-600",
      value: "text-emerald-955",
      icon: "text-emerald-600",
    },
  }[color];

  return (
    <div className={`flex items-center gap-3 rounded-2xl p-4 shadow-sm transition-all duration-200 hover:shadow-md ${colors.bg} ${colSpan2 ? "col-span-2" : ""}`}>
      <div className={`flex-shrink-0 ${colors.icon}`}>{icon}</div>
      <div>
        <p className={`text-[9px] font-extrabold uppercase tracking-wider mb-0.5 leading-none ${colors.label}`}>{label}</p>
        <div className={`text-sm font-extrabold tracking-tight ${colors.value}`}>{value}</div>
      </div>
    </div>
  );
};

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
  const [disputeModalAttendanceId, setDisputeModalAttendanceId] = useState<number | null>(null);

  const refreshData = async (jobNumber: number) => {
    const jobData = await jobService.getJobById(jobNumber);
    setJob(jobData);
    try { setApplicants(await jobApplicationService.getJobApplicants(jobNumber)); } catch { setApplicants([]); }
    try { setAttendanceRecords(await attendanceService.getJobAttendance(jobNumber)); } catch { setAttendanceRecords([]); }
    try { setRatings((await ratingService.getJobRatings(jobNumber)) || []); } catch { setRatings([]); }
  };

  useEffect(() => {
    const fetchJob = async () => {
      if (!jobId) return;
      try {
        setLoading(true);
        await refreshData(Number(jobId));
      } catch { setError(t("jobDetails.failedToLoad")); }
      finally { setLoading(false); }
    };
    fetchJob();
  }, [jobId]);

  useEffect(() => {
    const refresh = async (payload: { jobId: number }) => {
      if (payload.jobId !== Number(jobId)) return;
      try { await refreshData(Number(jobId)); } catch {}
    };

    const handleJobApplied = (application: any) => {
      if (application.jobId !== Number(jobId)) return;
      setApplicants((prev) => {
        if (prev.some((a) => a.id === application.id)) return prev;
        return [...prev, application];
      });
    };

    const handlePaymentUpdate = (updatedPayment: any) => {
      if (updatedPayment.jobId !== Number(jobId)) return;
      setJob((prev: any) => {
        if (!prev) return prev;
        const updatedPayments = prev.payments?.map((p: any) =>
          p.id === updatedPayment.id ? { ...p, ...updatedPayment } : p
        ) || [];
        return { ...prev, payments: updatedPayments };
      });
    };

    const handleJobUpdate = (updatedJob: any) => {
      if (updatedJob.jobId !== Number(jobId)) return;
      refreshData(Number(jobId));
    };

    socketService.on("attendance:checked-in", refresh);
    socketService.on("attendance:checked-out", refresh);
    socketService.on("attendance:approved", refresh);
    socketService.on("attendance:issue-reported", refresh);
    socketService.on("dispute:created", refresh);
    socketService.on("dispute:updated", refresh);
    socketService.on("dispute:countered", refresh);
    socketService.on("job:applied", handleJobApplied);
    socketService.on("payment:paid", handlePaymentUpdate);
    socketService.on("payment:confirmed", handlePaymentUpdate);
    socketService.on("job:updated", handleJobUpdate);

    return () => {
      socketService.off("attendance:checked-in", refresh);
      socketService.off("attendance:checked-out", refresh);
      socketService.off("attendance:approved", refresh);
      socketService.off("attendance:issue-reported", refresh);
      socketService.off("dispute:created", refresh);
      socketService.off("dispute:updated", refresh);
      socketService.off("dispute:countered", refresh);
      socketService.off("job:applied", handleJobApplied);
      socketService.off("payment:paid", handlePaymentUpdate);
      socketService.off("payment:confirmed", handlePaymentUpdate);
      socketService.off("job:updated", handleJobUpdate);
    };
  }, [jobId]);

  const handleCancel = async () => {
    if (!jobId) return;
    try {
      setAction("canceling");
      await jobService.cancelJob(Number(jobId));
      toast.success(t("jobDetails.cancelSuccess", "Job cancelled successfully"));
      navigate("/jobs/my");
    } catch (err: any) {
      const msg = err?.response?.data?.message || t("jobDetails.failedToCancel");
      toast.error(msg);
    } finally {
      setAction(undefined);
    }
  };

  const handleComplete = async () => {
    if (!jobId) return;
    try {
      setAction("completing");
      await jobService.completeJob(Number(jobId));
      toast.success(t("jobDetails.completeSuccess", "Job marked completed successfully"));
      setJob({ ...job, status: "COMPLETED" });
    } catch (err: any) {
      const msg = err?.response?.data?.message || t("jobDetails.failedToComplete");
      toast.error(msg);
    } finally {
      setAction(undefined);
    }
  };

  const handleApproveAttendance = async (attendanceId: number) => {
    if (!jobId) return;
    try {
      setAction(`approve-${attendanceId}`);
      await attendanceService.approveAttendance(attendanceId);
      toast.success(t("jobDetails.approveSuccess", "Attendance approved successfully"));
      await refreshData(Number(jobId));
    } catch (err: any) {
      toast.error(t("jobDetails.failedToApprove"));
    } finally {
      setAction(undefined);
    }
  };

  const handleRaiseDispute = async (data: { reason: string; description: string }) => {
    if (!jobId || !disputeModalAttendanceId) return;
    try {
      setAction(`dispute-${disputeModalAttendanceId}`);
      await disputeService.createDispute({
        jobId: Number(jobId),
        attendanceId: disputeModalAttendanceId,
        reason: data.reason,
        description: data.description,
      });
      setDisputeModalAttendanceId(null);
      await refreshData(Number(jobId));
    } catch {
      setError(t("jobDetails.failedToCreateDispute"));
      throw new Error();
    } finally {
      setAction(undefined);
    }
  };

  const selectedApplicants = getSelectedApplicants(applicants);

  const isAllPaymentsDone = () => {
    const selectedApps = applicants.filter(
      (a) => a.status === "SELECTED" || a.status === "COMPLETED",
    );
    if (selectedApps.length === 0) return false;
    return selectedApps.every((app) => {
      const payment = job.payments?.find((p: any) => p.workerId === app.workerId);
      return payment && payment.status === "COMPLETED";
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 size={36} className="text-indigo-650 animate-spin" />
        <p className="text-slate-400 text-sm font-semibold">{t("common.loading")}</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="rounded-3xl bg-white p-8 text-center border border-slate-100 shadow-sm">
        <SearchX size={40} className="text-slate-200 mx-auto mb-3" />
        <p className="text-slate-600 font-bold">{t("jobDetails.jobNotFound")}</p>
      </div>
    );
  }

  const locationDisplay = buildLocationDisplay(job);
  const description     = cleanDescription(job.description);

  return (
    <div className="space-y-4">
      <PageHeader
        title={job.title}
        subtitle={t(`jobs.categories.${job.category}`, job.category) as string}
      />

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-700 flex items-center gap-2 font-medium">
          <AlertTriangle size={15} className="flex-shrink-0" /> {error}
        </div>
      )}

      {/* ── Job Overview ── */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className={`h-1.5 w-full ${
          job.status === "OPEN"      ? "bg-gradient-to-r from-emerald-400 to-emerald-500" :
          job.status === "ASSIGNED"  ? "bg-gradient-to-r from-amber-400 to-amber-500" :
          job.status === "COMPLETED" ? "bg-gradient-to-r from-sky-400 to-sky-500" :
                                       "bg-slate-350"
        }`} />

        <div className="p-5">
          {/* Status + Wage */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-[9px] text-slate-450 font-extrabold uppercase tracking-wider mb-1.5 leading-none">{t("jobDetails.status")}</p>
              <StatusBadge status={job.status} size="lg" />
            </div>
            <div className="text-right">
              <p className="text-[9px] text-slate-450 font-extrabold uppercase tracking-wider mb-1.5 leading-none">{t("jobDetails.wage")}</p>
              <p className="text-3xl font-black text-indigo-600 flex items-center justify-end gap-0.5 tracking-tight">
                <IndianRupee size={20} strokeWidth={3} className="text-indigo-500" />
                {job.wage}
              </p>
              <p className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase tracking-wide">{t("jobs.perDay", "per day")}</p>
            </div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3">
            <InfoTile
              colSpan2
              color="amber"
              icon={<CalendarDays size={18} />}
              label={t("jobDetails.jobDate")}
              value={formatDate(job.jobDate)}
            />

            {job.expectedStartTime && job.expectedEndTime && (
              <InfoTile
                colSpan2
                color="slate"
                icon={<Clock size={18} />}
                label={t("jobs.timing", "Work Timing")}
                value={
                  <span>
                    {job.expectedStartTime} – {job.expectedEndTime}
                    {job.expectedWorkingHours && (
                      <span className="ml-2 text-xs font-normal opacity-60">({job.expectedWorkingHours}h)</span>
                    )}
                  </span>
                }
              />
            )}

            <InfoTile
              color="slate"
              icon={<Users size={18} />}
              label={t("jobDetails.requiredWorkers")}
              value={job.requiredWorkers}
            />

            <InfoTile
              color="slate"
              icon={<Tag size={18} />}
              label={t("jobs.category")}
              value={t(`jobs.categories.${job.category}`, job.category) as string}
            />

            {/* Applicant stats */}
            <div className="flex items-center gap-3 rounded-2xl p-4 shadow-sm transition-all duration-200 hover:shadow-md bg-indigo-50/50 border border-indigo-50/85 col-span-1">
              <Send size={16} className="text-indigo-650 flex-shrink-0" />
              <div>
                <p className="text-[9px] text-indigo-500 font-extrabold uppercase tracking-wider mb-0.5 leading-none">{t("jobDetails.applied")}</p>
                <p className="text-2xl font-black text-indigo-950 tracking-tight">
                  {applicants.filter((a) => a.status === "APPLIED").length}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl p-4 shadow-sm transition-all duration-200 hover:shadow-md bg-indigo-50/60 border border-indigo-100 col-span-1">
              <CheckCircle2 size={16} className="text-indigo-650 flex-shrink-0" />
              <div>
                <p className="text-[9px] text-indigo-500 font-extrabold uppercase tracking-wider mb-0.5 leading-none">{t("jobDetails.selected")}</p>
                <p className="text-2xl font-black text-indigo-950 tracking-tight">
                  {applicants.filter((a) => a.status === "SELECTED" || a.status === "COMPLETED").length}
                </p>
              </div>
            </div>
          </div>

          {/* Location */}
          {locationDisplay && (
            <div className="mt-3 flex items-start gap-3 bg-indigo-50/30 border border-indigo-100/50 rounded-2xl p-4">
              <MapPin size={16} className="text-indigo-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[9px] text-indigo-500 font-extrabold uppercase tracking-wider mb-0.5 leading-none">{t("jobDetails.location")}</p>
                <p className="text-xs font-semibold text-indigo-900 leading-snug">{locationDisplay}</p>
              </div>
            </div>
          )}

          {/* Description */}
          {description && (
            <div className="mt-4">
              <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">{t("jobDetails.description")}</p>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/80 rounded-2xl p-4 border border-slate-100 font-medium">{description}</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Selected Workers ── */}
      {selectedApplicants.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="bg-indigo-700 px-5 py-3 flex items-center gap-2">
            <Timer size={15} className="text-indigo-100" />
            <p className="text-white font-bold text-sm">{t("jobDetails.selectedWorkersAttendance")}</p>
          </div>
          <div className="p-4 space-y-3">
            {selectedApplicants.map((selectedApplicant) => {
              const attendance     = attendanceRecords.find((r) => r.workerId === selectedApplicant.workerId);
              const payment        = job.payments?.find((p: any) => p.workerId === selectedApplicant.workerId);
              const isPaid         = payment?.status === "COMPLETED";
              const existingRating = ratings.find((r) => r.fromUserId === user?.id && r.toUserId === selectedApplicant.worker?.userId);
              const status         = attendance?.status ?? selectedApplicant.status;
              const canReview      = attendance?.status === "PENDING_REVIEW";
              const workerName     = attendance?.worker?.name ?? selectedApplicant.worker?.name ?? t("jobDetails.worker");

              return (
                <div key={selectedApplicant.id} className="rounded-2xl border border-indigo-100 bg-indigo-50/20 p-4">
                  {/* Worker header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-sm font-bold text-indigo-750 border border-indigo-100">
                        {workerName[0]?.toUpperCase() ?? "W"}
                      </div>
                      <div>
                        <p className="font-extrabold text-indigo-950 text-sm">{workerName}</p>
                        <p className="text-xs font-semibold text-indigo-500">
                          {t("jobDetails.reliability", { score: selectedApplicant.worker?.reliabilityScore ?? 0 })}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={status} size="lg" />
                  </div>

                  {/* Attendance time grid */}
                  <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                    {[
                      { icon: <LogIn size={13} className="text-indigo-650 mx-auto mb-0.5" />, label: "Check-in",  value: attendance?.checkInTime  ? new Date(attendance.checkInTime).toLocaleTimeString("en-IN",  { hour: "2-digit", minute: "2-digit" }) : "–" },
                      { icon: <LogOut size={13} className="text-indigo-50 mx-auto mb-0.5" />, label: "Check-out", value: attendance?.checkOutTime ? new Date(attendance.checkOutTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "–" },
                      { icon: <Timer size={13} className="text-indigo-400 mx-auto mb-0.5" />, label: "Hours",     value: attendance?.totalHours ?? "–" },
                    ].map(({ icon, label, value }) => (
                      <div key={label} className="bg-white rounded-xl p-2.5 border border-indigo-100/50">
                        {icon}
                        <p className="text-[9px] text-indigo-500 uppercase font-extrabold leading-none mb-0.5">{label}</p>
                        <p className="text-xs font-bold text-indigo-800 mt-0.5">{value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Buttons — Approve + Raise Dispute only */}
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => attendance && handleApproveAttendance(attendance.id)} 
                      disabled={!canReview} 
                      loading={attendance ? action === `approve-${attendance.id}` : false}
                      className="flex-1 flex items-center justify-center gap-1.5 border-indigo-100 hover:bg-indigo-50 text-indigo-700"
                    >
                      <ShieldCheck size={14} />{t("jobDetails.approve")}
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 flex items-center justify-center gap-1.5 border-rose-200 text-rose-700 hover:bg-rose-50"
                      onClick={() => attendance && setDisputeModalAttendanceId(attendance.id)}
                      disabled={!canReview}
                      loading={attendance ? action === `dispute-${attendance.id}` : false}
                    >
                      <Flag size={14} />{t("jobDetails.raiseDispute")}
                    </Button>
                  </div>

                  {/* Dispute Display */}
                  {attendance?.status === "ISSUE_REPORTED" && attendance.disputes && attendance.disputes.length > 0 && (
                    <div className="mt-3">
                      <DisputeDetailsPanel
                        dispute={attendance.disputes[0]}
                        currentUserRole="EMPLOYER"
                        onCounterClick={() => setDisputeModalAttendanceId(attendance.id)}
                      />
                    </div>
                  )}

                  {/* Rating */}
                  {job.status === "COMPLETED" && (
                    <div className="mt-3 pt-3 border-t border-indigo-100/50 flex items-center justify-between text-xs font-semibold">
                      <span className="text-indigo-500 flex items-center gap-1.5">
                        <Star size={13} className="text-amber-550 fill-amber-400" />
                        {t("jobDetails.feedback")}
                      </span>
                      {existingRating ? (
                        <span className="font-bold text-indigo-750">{t("jobDetails.rated", { value: existingRating.ratingValue })}</span>
                      ) : isPaid ? (
                        <Button variant="outline" onClick={() => { setRatingWorkerUserId(selectedApplicant.worker.userId); setRatingWorkerName(selectedApplicant.worker.name); }} className="text-[10px] py-1 px-2.5 border-indigo-100 text-indigo-700">
                          {t("jobDetails.rateWorker")}
                        </Button>
                      ) : (
                        <span className="text-slate-400 italic text-[11px] font-medium">{t("jobDetails.completePaymentToRate")}</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Employer Actions ── */}
      <div className="space-y-3">
        {job.status === "OPEN" && (
          <>
            <Button 
              fullWidth 
              onClick={() => navigate(`/jobs/${jobId}/applicants`)}
              className="flex items-center justify-center gap-2 shadow-sm shadow-indigo-100 transition-all hover:shadow-indigo-200"
            >
              <Users size={16} />
              {t("jobDetails.viewApplicants", { count: applicants.length })}
            </Button>
            <Button 
              fullWidth 
              variant="outline" 
              onClick={() => navigate(`/jobs/${jobId}/edit`)} 
              className="border-slate-300 text-slate-705 hover:bg-slate-50 flex items-center justify-center gap-2"
            >
              <Clock size={16} />
              {t("jobDetails.editJob", "Edit Job")}
            </Button>
            <Button 
              fullWidth 
              variant="outline" 
              onClick={handleCancel} 
              loading={action === "canceling"}
              className="border-rose-200 text-rose-700 hover:bg-rose-50 flex items-center justify-center gap-2"
            >
              <X size={16} />
              {t("jobDetails.cancelJob")}
            </Button>
          </>
        )}

        {job.status === "ASSIGNED" && (
          <>
            <Button 
              fullWidth 
              onClick={() => navigate(`/jobs/${jobId}/payments`)}
              className="flex items-center justify-center gap-2 shadow-sm shadow-indigo-100 transition-all hover:shadow-indigo-200"
            >
              <CreditCard size={16} />
              {t("jobDetails.viewPayments")}
            </Button>
            <Button 
              fullWidth 
              variant="outline" 
              onClick={() => navigate(`/jobs/${jobId}/edit`)} 
              className="border-slate-300 text-slate-705 hover:bg-slate-50 flex items-center justify-center gap-2"
            >
              <Clock size={16} />
              {t("jobDetails.editJob", "Edit Job")}
            </Button>
            <div className="space-y-1.5">
              <Button
                fullWidth
                variant="outline"
                onClick={handleComplete}
                loading={action === "completing"}
                disabled={!isAllPaymentsDone()}
                className="border-slate-300 text-slate-705 hover:bg-slate-50 flex items-center justify-center gap-2"
              >
                <FlagTriangleRight size={16} />
                {t("jobDetails.markComplete")}
              </Button>
              {!isAllPaymentsDone() && (
                <p className="text-[10px] text-center text-rose-600 font-bold uppercase tracking-wider mt-1.5 leading-snug">
                  {t("jobDetails.paymentsPendingWarning", "You must complete all payments for selected workers before marking this job complete.")}
                </p>
              )}
            </div>
          </>
        )}

        {job.status === "COMPLETED" && (
          <Button fullWidth variant="secondary" disabled className="bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center gap-2">
            <CheckCircle2 size={16} />
            {t("jobDetails.jobCompleted")}
          </Button>
        )}
      </div>

      {/* ── Dispute Modal ── */}
      <DisputeFormModal
        isOpen={disputeModalAttendanceId !== null}
        onClose={() => setDisputeModalAttendanceId(null)}
        onSubmit={handleRaiseDispute}
        isSubmitting={action === `dispute-${disputeModalAttendanceId}`}
        callerRole="EMPLOYER"
      />

      {/* ── Rating Modal ── */}
      {ratingWorkerUserId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-indigo-950/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-indigo-100">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-indigo-950">{t("jobDetails.rateWorker")}</h3>
                <p className="text-xs text-indigo-500 mt-0.5">{t("jobDetails.ratingFor", { name: ratingWorkerName })}</p>
              </div>
              <button onClick={() => setRatingWorkerUserId(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-50/50 hover:bg-indigo-100/80 text-indigo-600 transition-colors">
                <X size={16} />
              </button>
            </div>
            <RatingForm
              jobId={Number(jobId)}
              toUserId={ratingWorkerUserId!}
              onSuccess={() => { setRatingWorkerUserId(null); if (jobId) refreshData(Number(jobId)); }}
              onCancel={() => setRatingWorkerUserId(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

