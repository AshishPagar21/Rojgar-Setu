import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
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

/** Unified info tile — brand shades only */
const InfoTile = ({
  icon,
  label,
  value,
  shade = "light",
  colSpan2 = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  shade?: "light" | "mid" | "strong";
  colSpan2?: boolean;
}) => {
  const bg      = shade === "strong" ? "bg-brand-200" : shade === "mid" ? "bg-brand-100" : "bg-brand-50";
  const lColor  = shade === "strong" ? "text-brand-700" : shade === "mid" ? "text-brand-600" : "text-brand-500";
  const vColor  = shade === "strong" ? "text-brand-900" : shade === "mid" ? "text-brand-800" : "text-brand-700";
  const iColor  = shade === "strong" ? "text-brand-600" : shade === "mid" ? "text-brand-500" : "text-brand-400";
  return (
    <div className={`flex items-center gap-3 rounded-xl p-3 ${bg} ${colSpan2 ? "col-span-2" : ""}`}>
      <div className={`flex-shrink-0 ${iColor}`}>{icon}</div>
      <div>
        <p className={`text-[10px] font-semibold uppercase tracking-wide ${lColor}`}>{label}</p>
        <div className={`text-sm font-bold ${vColor}`}>{value}</div>
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
  // Dispute modal state
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
    socketService.on("attendance:checked-in", refresh);
    socketService.on("attendance:checked-out", refresh);
    socketService.on("attendance:approved", refresh);
    socketService.on("attendance:issue-reported", refresh);
    socketService.on("dispute:created", refresh);
    socketService.on("dispute:updated", refresh);
    socketService.on("dispute:countered", refresh);
    return () => {
      socketService.off("attendance:checked-in", refresh);
      socketService.off("attendance:checked-out", refresh);
      socketService.off("attendance:approved", refresh);
      socketService.off("attendance:issue-reported", refresh);
      socketService.off("dispute:created", refresh);
      socketService.off("dispute:updated", refresh);
      socketService.off("dispute:countered", refresh);
    };
  }, [jobId]);

  const handleCancel = async () => {
    if (!jobId) return;
    try { setAction("canceling"); await jobService.cancelJob(Number(jobId)); navigate("/jobs/my"); }
    catch { setError(t("jobDetails.failedToCancel")); }
    finally { setAction(undefined); }
  };

  const handleComplete = async () => {
    if (!jobId) return;
    try { setAction("completing"); await jobService.completeJob(Number(jobId)); setJob({ ...job, status: "COMPLETED" }); }
    catch { setError(t("jobDetails.failedToComplete")); }
    finally { setAction(undefined); }
  };

  const handleApproveAttendance = async (attendanceId: number) => {
    if (!jobId) return;
    try { setAction(`approve-${attendanceId}`); await attendanceService.approveAttendance(attendanceId); await refreshData(Number(jobId)); }
    catch { setError(t("jobDetails.failedToApprove")); }
    finally { setAction(undefined); }
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
      throw new Error(); // surface to modal
    } finally {
      setAction(undefined);
    }
  };

  const selectedApplicants = getSelectedApplicants(applicants);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 size={36} className="text-brand-500 animate-spin" />
        <p className="text-slate-400 text-sm">{t("common.loading")}</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center border border-brand-100">
        <SearchX size={40} className="text-brand-200 mx-auto mb-3" />
        <p className="text-slate-600 font-medium">{t("jobDetails.jobNotFound")}</p>
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
        <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-700 flex items-center gap-2">
          <AlertTriangle size={15} className="flex-shrink-0" /> {error}
        </div>
      )}

      {/* ── Job Overview ── */}
      <div className="bg-white rounded-2xl border border-brand-100 shadow-sm overflow-hidden">
        <div className={`h-1.5 w-full ${
          job.status === "OPEN"      ? "bg-gradient-to-r from-brand-400 to-brand-600" :
          job.status === "ASSIGNED"  ? "bg-brand-700" :
          job.status === "COMPLETED" ? "bg-brand-900" :
                                       "bg-slate-300"
        }`} />

        <div className="p-5">
          {/* Status + Wage */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-1">{t("jobDetails.status")}</p>
              <StatusBadge status={job.status} />
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-1">{t("jobDetails.wage")}</p>
              <p className="text-3xl font-extrabold text-brand-600 flex items-center justify-end gap-0.5">
                <IndianRupee size={22} strokeWidth={2.5} />
                {job.wage}
              </p>
              <p className="text-[10px] text-slate-400">{t("jobs.perDay", "per day")}</p>
            </div>
          </div>

          {/* Info grid — brand shades only */}
          <div className="grid grid-cols-2 gap-3">
            <InfoTile
              colSpan2 shade="light"
              icon={<CalendarDays size={18} />}
              label={t("jobDetails.jobDate")}
              value={formatDate(job.jobDate)}
            />

            {job.expectedStartTime && job.expectedEndTime && (
              <InfoTile
                colSpan2 shade="mid"
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
              shade="strong"
              icon={<Users size={18} />}
              label={t("jobDetails.requiredWorkers")}
              value={job.requiredWorkers}
            />

            <InfoTile
              shade="light"
              icon={<Tag size={18} />}
              label={t("jobs.category")}
              value={t(`jobs.categories.${job.category}`, job.category)}
            />

            {/* Applicant stats — larger numbers */}
            <div className="flex items-center gap-3 rounded-xl p-3 bg-brand-100 col-span-1">
              <Send size={18} className="text-brand-500 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-brand-600 font-semibold uppercase tracking-wide">{t("jobDetails.applied")}</p>
                <p className="text-2xl font-extrabold text-brand-800">
                  {applicants.filter((a) => a.status === "APPLIED").length}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl p-3 bg-brand-200 col-span-1">
              <CheckCircle2 size={18} className="text-brand-600 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-brand-700 font-semibold uppercase tracking-wide">{t("jobDetails.selected")}</p>
                <p className="text-2xl font-extrabold text-brand-900">
                  {applicants.filter((a) => a.status === "SELECTED" || a.status === "COMPLETED").length}
                </p>
              </div>
            </div>
          </div>

          {/* Location */}
          {locationDisplay && (
            <div className="mt-3 flex items-start gap-3 bg-brand-50 border border-brand-100 rounded-xl p-3">
              <MapPin size={17} className="text-brand-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] text-brand-500 font-semibold uppercase tracking-wide">{t("jobDetails.location")}</p>
                <p className="text-sm font-medium text-brand-800 leading-snug">{locationDisplay}</p>
              </div>
            </div>
          )}

          {/* Description */}
          {description && (
            <div className="mt-3">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">{t("jobDetails.description")}</p>
              <p className="text-sm text-slate-600 leading-relaxed bg-brand-50 rounded-xl p-3">{description}</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Selected Workers ── */}
      {selectedApplicants.length > 0 && (
        <div className="bg-white rounded-2xl border border-brand-100 shadow-sm overflow-hidden">
          <div className="bg-brand-700 px-5 py-3 flex items-center gap-2">
            <Timer size={15} className="text-brand-200" />
            <p className="text-white font-semibold text-sm">{t("jobDetails.selectedWorkersAttendance")}</p>
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
                <div key={selectedApplicant.id} className="rounded-xl border border-brand-100 bg-brand-50 p-4">
                  {/* Worker header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-sm font-bold text-brand-700">
                        {workerName[0]?.toUpperCase() ?? "W"}
                      </div>
                      <div>
                        <p className="font-bold text-brand-900 text-sm">{workerName}</p>
                        <p className="text-xs text-brand-500">
                          {t("jobDetails.reliability", { score: selectedApplicant.worker?.reliabilityScore ?? 0 })}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={status} />
                  </div>

                  {/* Attendance time grid */}
                  <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                    {[
                      { icon: <LogIn size={13} className="text-brand-400 mx-auto mb-0.5" />, label: "Check-in",  value: attendance?.checkInTime  ? new Date(attendance.checkInTime).toLocaleTimeString("en-IN",  { hour: "2-digit", minute: "2-digit" }) : "–" },
                      { icon: <LogOut size={13} className="text-brand-500 mx-auto mb-0.5" />, label: "Check-out", value: attendance?.checkOutTime ? new Date(attendance.checkOutTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "–" },
                      { icon: <Timer size={13} className="text-brand-600 mx-auto mb-0.5" />, label: "Hours",     value: attendance?.totalHours ?? "–" },
                    ].map(({ icon, label, value }) => (
                      <div key={label} className="bg-white rounded-lg p-2 border border-brand-100">
                        {icon}
                        <p className="text-[9px] text-brand-400 uppercase font-semibold">{label}</p>
                        <p className="text-xs font-bold text-brand-800 mt-0.5">{value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Buttons — Approve + Raise Dispute only */}
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => attendance && handleApproveAttendance(attendance.id)} disabled={!canReview} loading={attendance ? action === `approve-${attendance.id}` : false}>
                      <span className="flex items-center gap-1.5"><ShieldCheck size={14} />{t("jobDetails.approve")}</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() => attendance && setDisputeModalAttendanceId(attendance.id)}
                      disabled={!canReview}
                      loading={attendance ? action === `dispute-${attendance.id}` : false}
                    >
                      <span className="flex items-center gap-1.5"><Flag size={14} />{t("jobDetails.raiseDispute")}</span>
                    </Button>
                  </div>

                  {/* Symmetrical Dispute Display */}
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
                    <div className="mt-3 pt-3 border-t border-brand-100 flex items-center justify-between text-sm">
                      <span className="text-brand-500 font-medium flex items-center gap-1.5">
                        <Star size={13} className="text-brand-400 fill-brand-200" />
                        {t("jobDetails.feedback")}
                      </span>
                      {existingRating ? (
                        <span className="font-bold text-brand-700">{t("jobDetails.rated", { value: existingRating.ratingValue })}</span>
                      ) : isPaid ? (
                        <Button variant="outline" onClick={() => { setRatingWorkerUserId(selectedApplicant.worker.userId); setRatingWorkerName(selectedApplicant.worker.name); }} className="text-xs py-1 px-3">
                          {t("jobDetails.rateWorker")}
                        </Button>
                      ) : (
                        <span className="text-slate-400 italic text-xs">{t("jobDetails.completePaymentToRate")}</span>
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
            <Button fullWidth onClick={() => navigate(`/jobs/${jobId}/applicants`)} className="bg-brand-600 hover:bg-brand-700">
              <span className="flex items-center justify-center gap-2">
                <Users size={16} />
                {t("jobDetails.viewApplicants", { count: applicants.length })}
              </span>
            </Button>
            <Button fullWidth variant="outline" onClick={handleCancel} loading={action === "canceling"}>
              <span className="flex items-center justify-center gap-2"><X size={16} />{t("jobDetails.cancelJob")}</span>
            </Button>
          </>
        )}

        {job.status === "ASSIGNED" && (
          <>
            <Button fullWidth onClick={() => navigate(`/jobs/${jobId}/payments`)} className="bg-brand-600 hover:bg-brand-700">
              <span className="flex items-center justify-center gap-2"><CreditCard size={16} />{t("jobDetails.viewPayments")}</span>
            </Button>
            <Button fullWidth variant="outline" onClick={handleComplete} loading={action === "completing"}>
              <span className="flex items-center justify-center gap-2"><FlagTriangleRight size={16} />{t("jobDetails.markComplete")}</span>
            </Button>
          </>
        )}

        {job.status === "COMPLETED" && (
          <Button fullWidth variant="secondary" disabled>
            <span className="flex items-center justify-center gap-2"><CheckCircle2 size={16} />{t("jobDetails.jobCompleted")}</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-brand-100">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-brand-900">{t("jobDetails.rateWorker")}</h3>
                <p className="text-xs text-brand-500 mt-0.5">{t("jobDetails.ratingFor", { name: ratingWorkerName })}</p>
              </div>
              <button onClick={() => setRatingWorkerUserId(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-brand-50 hover:bg-brand-100 text-brand-500 transition-colors">
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
