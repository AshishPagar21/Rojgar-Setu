import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import {
  CalendarDays,
  Clock,
  Users,
  Tag,
  MapPin,
  User,
  Star,
  IndianRupee,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Flag,
  Timer,
  LogIn,
  LogOut,
  SearchX,
  ClipboardList,
  ShieldCheck,
  Loader2,
} from "lucide-react";

import { Button } from "../../components/common/Button";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { PageHeader } from "../../components/common/PageHeader";
import { StatusBadge } from "../../components/common/StatusBadge";
import { RatingForm } from "../../components/common/RatingForm";
import { DisputeFormModal } from "../../components/common/DisputeFormModal";
import { DisputeDetailsPanel } from "../../components/common/DisputeDetailsPanel";
import { useAuth } from "../../hooks/useAuth";
import { disputeService } from "../../modules/dispute/dispute.service";
import { jobService } from "../../modules/job/job.service";
import { jobApplicationService } from "../../modules/jobApplication/jobApplication.service";
import { attendanceService } from "../../modules/attendance/attendance.service";
import { paymentService } from "../../modules/payment/payment.service";
import { ratingService } from "../../modules/rating/rating.service";
import { socketService } from "../../services/socket.service";
import { getErrorMessage } from "../../utils/helpers";
import { getCurrentLocation } from "../../utils/geolocation";

const cleanDescription = (description?: string | null) =>
  (description ?? "").replace(/\n*\n*Location:\s*[^\n]+/i, "").trim();

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

export const WorkerJobDetailsPage = () => {
  const { t } = useTranslation();
  const { jobId } = useParams<{ jobId: string }>();
  const { user, profile } = useAuth();
  const [job, setJob] = useState<any>(null);
  const [application, setApplication] = useState<any>(null);
  const [attendance, setAttendance] = useState<any>(null);
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [action, setAction] = useState<string>();
  const [ratings, setRatings] = useState<any[]>([]);
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const fetchData = async () => {
    if (!jobId) return;
    try {
      setLoading(true);
      const jobData = await jobService.getJobById(Number(jobId));
      setJob(jobData);
      try {
        const ratingsData = await ratingService.getJobRatings(Number(jobId));
        setRatings(ratingsData || []);
      } catch {}
      try {
        const apps = await jobApplicationService.getMyApplications();
        const userApp = apps.find((a: any) => a.jobId === Number(jobId));
        setApplication(userApp);
        if (userApp?.status === "SELECTED" || userApp?.status === "COMPLETED") {
          try {
            const history = await attendanceService.getMyAttendance();
            setAttendance(history.find((r: any) => r.jobId === Number(jobId)) ?? null);
          } catch {}
          try {
            const paymentData = await paymentService.getJobPayments(Number(jobId));
            if (paymentData?.length > 0) setPayment(paymentData[0]);
          } catch {}
        }
      } catch {}
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [jobId]);

  useEffect(() => {
    const refresh = async (payload: { jobId: number; workerId: number }) => {
      if (payload.jobId !== Number(jobId)) return;
      if (profile?.worker?.id && payload.workerId !== profile.worker.id) return;
      try {
        const history = await attendanceService.getMyAttendance();
        setAttendance(history.find((r: any) => r.jobId === Number(jobId)) ?? null);
      } catch {}
    };

    const handlePaymentUpdate = (updatedPayment: any) => {
      if (updatedPayment.jobId !== Number(jobId)) return;
      if (profile?.worker?.id && updatedPayment.workerId !== profile.worker.id) return;
      setPayment(updatedPayment);
    };

    const handleJobUpdate = (updatedJob: any) => {
      if (updatedJob.jobId !== Number(jobId)) return;
      fetchData();
    };

    socketService.on("attendance:checked-in", refresh);
    socketService.on("attendance:checked-out", refresh);
    socketService.on("attendance:approved", refresh);
    socketService.on("attendance:issue-reported", refresh);
    socketService.on("dispute:created", refresh);
    socketService.on("dispute:updated", refresh);
    socketService.on("dispute:countered", refresh);
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
      socketService.off("payment:paid", handlePaymentUpdate);
      socketService.off("payment:confirmed", handlePaymentUpdate);
      socketService.off("job:updated", handleJobUpdate);
    };
  }, [jobId, profile?.worker?.id]);

  const handleApply = async () => {
    if (!jobId) return;
    try {
      setAction("applying");
      await jobApplicationService.applyToJob(Number(jobId));
      const apps = await jobApplicationService.getMyApplications();
      setApplication(apps.find((a: any) => a.jobId === Number(jobId)));
      toast.success(t("jobDetails.applySuccess", "Applied successfully!"));
    } catch (err) {
      toast.error(getErrorMessage(err) || "Failed to apply to job");
    } finally {
      setAction(undefined);
    }
  };

  const handleWithdraw = async () => {
    if (!jobId) return;
    try {
      setAction("withdrawing");
      await jobApplicationService.withdrawApplication(Number(jobId));
      toast.success(t("jobDetails.withdrawSuccess", "Withdrawn successfully!"));
      setApplication(null);
      setConfirmOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err) || "Failed to withdraw application");
    } finally {
      setAction(undefined);
    }
  };

  const refreshAttendance = async () => {
    if (!jobId) return;
    const history = await attendanceService.getMyAttendance();
    setAttendance(history.find((r: any) => r.jobId === Number(jobId)) ?? null);
  };

  const handleCheckIn = async () => {
    if (!jobId) return;
    try {
      setAction("checking-in");
      const loc = await getCurrentLocation();
      await attendanceService.checkIn(Number(jobId), { latitude: loc.latitude, longitude: loc.longitude });
      toast.success(t("jobDetails.checkInSuccess"));
      await refreshAttendance();
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to mark attendance";
      toast.error(msg.includes("200 meters") ? t("jobDetails.notAtWorkLocationError") : msg);
    } finally { setAction(undefined); }
  };

  const handleCheckOut = async () => {
    if (!jobId) return;
    try {
      setAction("checking-out");
      const loc = await getCurrentLocation();
      await attendanceService.checkOut(Number(jobId), { latitude: loc.latitude, longitude: loc.longitude });
      toast.success(t("jobDetails.checkOutSuccess"));
      await refreshAttendance();
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to check out";
      toast.error(msg.includes("200 meters") ? t("jobDetails.mustBeAtWorkLocationError") : msg);
    } finally { setAction(undefined); }
  };

  const handleConfirmPaymentReceived = async () => {
    if (!payment?.id) return;
    try {
      setAction("confirming-payment");
      const updated = await paymentService.confirmPaymentReceived(payment.id);
      toast.success(t("jobDetails.paymentConfirmedSuccess"));
      setPayment(updated);
    } catch (err) {
      toast.error(getErrorMessage(err) || "Failed to confirm payment");
    } finally { setAction(undefined); }
  };

  const handleRaiseDispute = async (data: { reason: string; description: string }) => {
    if (!jobId || !attendance) return;
    try {
      setAction("raising-dispute");
      await disputeService.createDispute({
        jobId: Number(jobId),
        attendanceId: attendance.id,
        reason: data.reason.trim(),
        description: data.description.trim(),
      });
      toast.success(t("jobDetails.disputeRaisedSuccess"));
      setDisputeModalOpen(false);
      await refreshAttendance();
    } catch {
      setError(t("jobDetails.failedToCreateDispute"));
    } finally {
      setAction(undefined);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 size={36} className="text-indigo-600 animate-spin" />
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

  const getJobStartDateTime = (jobDate: string, expectedStartTime: string): Date => {
    const start = new Date(jobDate);
    const [hours, minutes] = (expectedStartTime || "00:00").split(":").map(Number);
    start.setHours(hours || 0, minutes || 0, 0, 0);
    return start;
  };

  const jobStart = getJobStartDateTime(job.jobDate, job.expectedStartTime);
  const now = new Date();
  const hoursRemaining = (jobStart.getTime() - now.getTime()) / (1000 * 60 * 60);
  const canWithdraw = hoursRemaining >= 10;

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
        {/* Accent bar */}
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
              <p className="text-[9px] text-slate-450 font-extrabold uppercase tracking-wider mb-1.5 leading-none">
                {t("jobDetails.jobStatus")}
              </p>
              <StatusBadge status={job.status} size="lg" />
            </div>
            <div className="text-right">
              <p className="text-[9px] text-slate-450 font-extrabold uppercase tracking-wider mb-1.5 leading-none">
                {t("jobDetails.wage")}
              </p>
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
          </div>

          {/* Employer */}
          <div className="mt-3 flex items-center gap-3 bg-indigo-50/30 border border-indigo-100/50 rounded-2xl p-4">
            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100">
              <User size={16} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-[9px] text-indigo-500 font-extrabold uppercase tracking-wider mb-0.5 leading-none">
                {t("jobs.employer", "Posted By")}
              </p>
              <p className="text-sm font-black text-indigo-950">{job.employer?.name ?? "–"}</p>
            </div>
            {job.employer?.rating > 0 && (
              <div className="ml-auto flex items-center gap-1 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-full">
                <Star size={12} className="text-amber-550 fill-amber-400 text-amber-500" />
                <span className="text-xs font-extrabold text-amber-700">{job.employer.rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          {/* Location */}
          {locationDisplay && (
            <div className="mt-3 flex items-start gap-3 bg-indigo-50/30 border border-indigo-100/50 rounded-2xl p-4">
              <MapPin size={16} className="text-indigo-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[9px] text-indigo-500 font-extrabold uppercase tracking-wider mb-0.5 leading-none">
                  {t("jobDetails.location")}
                </p>
                <p className="text-xs font-semibold text-indigo-900 leading-snug">{locationDisplay}</p>
              </div>
            </div>
          )}

          {/* Description */}
          {description && (
            <div className="mt-4">
              <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                {t("jobDetails.description")}
              </p>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/80 rounded-2xl p-4 border border-slate-100 font-medium">{description}</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Application Status ── */}
      {application && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
          <p className="text-[9px] font-extrabold text-indigo-500 uppercase tracking-wider mb-2 flex items-center gap-1.5 leading-none">
            <ClipboardList size={13} className="text-indigo-600" />
            {t("jobDetails.applicationStatus", "Application Status")}
          </p>
          <div className="flex items-center gap-3">
            <StatusBadge status={application.status} size="lg" />
            {application.status === "APPLIED" && (
              <p className="text-xs text-slate-500 font-medium">{t("jobDetails.applicationPending")}</p>
            )}
            {application.status === "SELECTED" && (
              <p className="text-xs text-indigo-650 font-bold">{t("jobDetails.youreSelected", "You've been selected!")}</p>
            )}
            {application.status === "REJECTED" && (
              <p className="text-xs text-rose-600 font-medium">{t("jobDetails.applicationRejected")}</p>
            )}
          </div>
        </div>
      )}

      {/* ── Attendance ── */}
      {application?.status === "SELECTED" && attendance && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="bg-indigo-600 px-4 py-3 flex items-center gap-2">
            <Timer size={15} className="text-indigo-100" />
            <p className="text-white font-bold text-sm">{t("attendance.status")}</p>
          </div>
          <div className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t("attendance.status")}</span>
              <StatusBadge status={attendance?.status} size="lg" />
            </div>
            {attendance?.checkInTime && (
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                  <LogIn size={14} className="text-indigo-650" />
                  {t("jobDetails.checkIn", { time: "" })}
                </span>
                <span className="font-extrabold text-indigo-950">
                  {new Date(attendance.checkInTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            )}
            {attendance?.checkOutTime && (
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                  <LogOut size={14} className="text-indigo-500" />
                  {t("jobDetails.checkOut", { time: "" })}
                </span>
                <span className="font-extrabold text-indigo-950">
                  {new Date(attendance.checkOutTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            )}
            {attendance?.totalHours && (
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                  <Timer size={14} className="text-slate-400" />
                  {t("jobDetails.hoursWorked", { hours: "" })}
                </span>
                <span className="font-black text-indigo-950">{attendance.totalHours}h</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Actions ── */}
      <div className="space-y-3">
        {!application && (
          <Button 
            fullWidth 
            onClick={handleApply} 
            loading={action === "applying"}
            className="flex items-center justify-center gap-2 shadow-sm shadow-indigo-100 transition-all hover:shadow-indigo-200"
          >
            {t("jobDetails.applyForJob")}
          </Button>
        )}

        {application?.status === "APPLIED" && (
          <div className="space-y-3">
            <div className="rounded-2xl bg-indigo-50 border border-indigo-100 p-4 text-center flex items-center justify-center gap-2">
              <Clock size={15} className="text-indigo-650 animate-pulse" />
              <p className="text-xs font-bold text-indigo-700">{t("jobDetails.applicationPending")}</p>
            </div>
            <Button
              fullWidth
              variant="outline"
              onClick={() => setConfirmOpen(true)}
              disabled={!canWithdraw}
              className="border-slate-300 text-slate-705 hover:bg-slate-50"
            >
              {t("jobDetails.withdrawApplication", "Withdraw Application")}
            </Button>
          </div>
        )}

        {application?.status === "REJECTED" && (
          <div className="rounded-2xl bg-rose-50 border border-rose-100 p-4 text-center flex items-center justify-center gap-2">
            <XCircle size={15} className="text-rose-500" />
            <p className="text-xs font-bold text-rose-700">{t("jobDetails.applicationRejected")}</p>
          </div>
        )}

        {application?.status === "SELECTED" && !attendance && (
          <div className="space-y-3">
            <Button 
              fullWidth 
              onClick={handleCheckIn} 
              loading={action === "checking-in"}
              className="flex items-center justify-center gap-2 shadow-sm shadow-indigo-100 transition-all hover:shadow-indigo-200"
            >
              <LogIn size={16} />
              {t("jobDetails.checkInBtn")}
            </Button>
            <Button
              fullWidth
              variant="outline"
              onClick={() => setConfirmOpen(true)}
              disabled={!canWithdraw}
              className="border-slate-300 text-slate-705 hover:bg-slate-50"
            >
              {t("jobDetails.withdrawSelection", "Withdraw from Selection")}
            </Button>
          </div>
        )}

        {attendance?.status === "CHECKED_IN" && (
          <Button 
            fullWidth 
            onClick={handleCheckOut} 
            loading={action === "checking-out"} 
            className="flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white shadow-sm shadow-amber-100 transition-all hover:shadow-amber-200"
          >
            <LogOut size={16} />
            {t("jobDetails.checkOutBtn")}
          </Button>
        )}

        {attendance?.status === "PENDING_REVIEW" && (
          <Button fullWidth variant="secondary" disabled className="bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center gap-2">
            <Clock size={16} />
            {t("jobDetails.waitingForEmployerReview")}
          </Button>
        )}

        {/* Payment panel */}
        {attendance?.status === "APPROVED" && (
          <div className="space-y-4 rounded-3xl bg-indigo-50/50 border border-indigo-100 p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-indigo-100/50 pb-3">
              <p className="text-sm font-extrabold text-indigo-950 flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-indigo-650" />
                {t("jobDetails.workApproved")}
              </p>
              <StatusBadge status={payment?.status ?? "PENDING"} size="lg" />
            </div>
            <p className="text-xs text-indigo-650 leading-relaxed font-semibold">{t("jobDetails.approvedText", { wage: `₹${job.wage}` })}</p>

            {payment?.status === "COMPLETED" || payment?.workerConfirmed ? (
              <>
                <div className="text-center py-3 text-sm font-extrabold text-indigo-950 bg-indigo-100/50 rounded-xl flex items-center justify-center gap-2 border border-indigo-100">
                  <CheckCircle2 size={16} className="text-indigo-650" />
                  {t("jobDetails.paymentReceivedConfirmed")}
                </div>
                {job.status === "COMPLETED" && (() => {
                  const existingRating = ratings.find(
                    (r) => r.fromUserId === user?.id && r.toUserId === job.employer.userId,
                  );
                  if (existingRating) {
                    return (
                      <div className="rounded-xl bg-amber-50 border border-amber-100 p-3 flex items-center gap-1.5 text-xs font-bold text-amber-700">
                        <Star size={12} className="text-amber-550 fill-amber-400" />
                        {t("jobDetails.youRatedEmployer", { value: existingRating.ratingValue })}
                      </div>
                    );
                  }
                  return (
                    <div className="bg-indigo-50/20 border border-indigo-100/40 rounded-2xl p-4">
                      <p className="text-xs text-indigo-650 mb-3 font-semibold">
                        {t("jobDetails.rateExperienceWith", { name: job.employer.name })}
                      </p>
                      <RatingForm jobId={Number(jobId)} toUserId={job.employer.userId} onSuccess={fetchData} />
                    </div>
                  );
                })()}
              </>
            ) : payment?.employerConfirmed ? (
              <Button
                fullWidth
                onClick={handleConfirmPaymentReceived}
                loading={action === "confirming-payment"}
                className="flex items-center justify-center gap-2 shadow-sm shadow-indigo-100 hover:shadow-indigo-200"
              >
                <IndianRupee size={16} />
                {t("jobDetails.markPaymentReceived")}
              </Button>
            ) : (
              <div className="text-center py-3 px-4 text-xs font-bold text-amber-700 bg-amber-50/50 rounded-2xl flex items-center justify-center gap-2 border border-amber-100/60">
                <Clock size={14} className="text-amber-600 flex-shrink-0 animate-pulse" />
                {t("payment.waitingEmployerMarkPaid", "Waiting for employer to send payment")}
              </div>
            )}
          </div>
        )}

        {attendance?.status === "ISSUE_REPORTED" && (
          <div className="space-y-3">
            <Button fullWidth variant="secondary" disabled className="bg-rose-50 border border-rose-100 text-rose-700 flex items-center justify-center gap-2">
              <AlertTriangle size={16} />
              {t("jobDetails.issueReported")}
            </Button>

            {attendance.disputes && attendance.disputes.length > 0 ? (
              <DisputeDetailsPanel
                dispute={attendance.disputes[0]}
                currentUserRole="WORKER"
                onCounterClick={() => setDisputeModalOpen(true)}
              />
            ) : (
              <Button
                fullWidth
                variant="outline"
                onClick={() => setDisputeModalOpen(true)}
                loading={action === "raising-dispute"}
                className="border-rose-200 text-rose-700 hover:bg-rose-50 flex items-center justify-center gap-2"
              >
                <Flag size={16} />
                {t("jobDetails.raiseDispute")}
              </Button>
            )}
          </div>
        )}
      </div>

      <DisputeFormModal
        isOpen={disputeModalOpen}
        onClose={() => setDisputeModalOpen(false)}
        onSubmit={handleRaiseDispute}
        isSubmitting={action === "raising-dispute"}
        callerRole="WORKER"
        title={
          attendance?.disputes?.[0]
            ? t("admin.defenseCounter") || "Submit Counter Dispute"
            : t("jobDetails.raiseDispute")
        }
      />

      <ConfirmDialog
        isOpen={confirmOpen}
        title={t("jobDetails.confirmWithdrawTitle", "Confirm Withdrawal")}
        message={t("jobDetails.confirmWithdrawMsg", "Are you sure you want to withdraw your application/selection? This cannot be undone.")}
        onConfirm={handleWithdraw}
        onCancel={() => setConfirmOpen(false)}
        loading={action === "withdrawing"}
      />
    </div>
  );
};
