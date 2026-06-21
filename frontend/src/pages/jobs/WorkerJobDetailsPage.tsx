import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { Button } from "../../components/common/Button";
import { RatingPopup } from "../../components/common/RatingPopup";
import { PageHeader } from "../../components/common/PageHeader";
import { StatusBadge } from "../../components/common/StatusBadge";
import { useAuth } from "../../hooks/useAuth";
import { disputeService } from "../../modules/dispute/dispute.service";
import { jobService } from "../../modules/job/job.service";
import { jobApplicationService } from "../../modules/jobApplication/jobApplication.service";
import { attendanceService } from "../../modules/attendance/attendance.service";
import { paymentService } from "../../modules/payment/payment.service"; // 👈 IMPORT YOUR NEW SERVICE
import { socketService } from "../../services/socket.service";
import { getErrorMessage } from "../../utils/helpers";
import { getCurrentLocation } from "../../utils/geolocation";
import { RatingForm } from "../../components/common/RatingForm";

const extractLocation = (description?: string | null) => {
  if (!description) return undefined;
  const match = description.match(/Location:\s*([^\n]+)/i);
  return match?.[1]?.trim();
};

const cleanDescription = (description?: string | null) =>
  (description ?? "").replace(/\n*\n*Location:\s*[^\n]+/i, "").trim();

export const WorkerJobDetailsPage = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const { profile } = useAuth();
  const [job, setJob] = useState<any>(null);
  const [application, setApplication] = useState<any>(null);
  const [attendance, setAttendance] = useState<any>(null);
  const [payment, setPayment] = useState<any>(null); // 👈 Added payment state tracking
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [action, setAction] = useState<string>();
  const [showEmployerRatingForm, setShowEmployerRatingForm] = useState(false);
  const [hasAutoOpenedRatingPrompt, setHasAutoOpenedRatingPrompt] =
    useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!jobId) return;
      try {
        setLoading(true);
        const jobData = await jobService.getJobById(Number(jobId));
        setJob(jobData);

        try {
          const apps = await jobApplicationService.getMyApplications();
          const userApp = apps.find((a: any) => a.jobId === Number(jobId));
          setApplication(userApp);

          if (userApp?.status === "SELECTED") {
            // Fetch Attendance Status
            try {
              const attendanceHistory =
                await attendanceService.getMyAttendance();
              const jobAttendance = attendanceHistory.find(
                (record: any) => record.jobId === Number(jobId),
              );
              setAttendance(jobAttendance ?? null);
            } catch {
              // No attendance yet
            }

            // 👇 FETCH PAYMENT CLEANLY USING SERVICE LAYER
            // Inside WorkerJobDetailsPage.tsx:
            try {
              const paymentData = await paymentService.getJobPayments(
                Number(jobId),
              );
              // paymentData is now the raw array directly!
              if (paymentData && paymentData.length > 0) {
                setPayment(paymentData[0]);
              }
            } catch (err) {
              console.error("Payment info not available yet", err);
            }
          }
        } catch {
          // Not applied yet
        }
      } catch (err) {
        setError(getErrorMessage(err));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [jobId]);

  useEffect(() => {
    const refreshAttendance = async (payload: {
      jobId: number;
      workerId: number;
    }) => {
      if (payload.jobId !== Number(jobId)) return;
      if (profile?.worker?.id && payload.workerId !== profile.worker.id) return;

      try {
        const attendanceHistory = await attendanceService.getMyAttendance();
        const jobAttendance = attendanceHistory.find(
          (record: any) => record.jobId === Number(jobId),
        );
        setAttendance(jobAttendance ?? null);
      } catch (err) {
        console.error(err);
      }
    };

    socketService.on("attendance:checked-in", refreshAttendance);
    socketService.on("attendance:checked-out", refreshAttendance);
    socketService.on("attendance:approved", refreshAttendance);
    socketService.on("attendance:issue-reported", refreshAttendance);

    return () => {
      socketService.off("attendance:checked-in", refreshAttendance);
      socketService.off("attendance:checked-out", refreshAttendance);
      socketService.off("attendance:approved", refreshAttendance);
      socketService.off("attendance:issue-reported", refreshAttendance);
    };
  }, [jobId, profile?.worker?.id]);

  const handleApply = async () => {
    if (!jobId) return;
    try {
      setAction("applying");
      await jobApplicationService.applyToJob(Number(jobId));
      const apps = await jobApplicationService.getMyApplications();
      const userApp = apps.find((a: any) => a.jobId === Number(jobId));
      setApplication(userApp);
    } catch (err) {
      setError(getErrorMessage(err));
      console.error(err);
    } finally {
      setAction(undefined);
    }
  };

  const refreshAttendance = async () => {
    if (!jobId) return;
    const attendanceHistory = await attendanceService.getMyAttendance();
    const jobAttendance = attendanceHistory.find(
      (record: any) => record.jobId === Number(jobId),
    );
    setAttendance(jobAttendance ?? null);
  };

  const handleCheckIn = async () => {
    if (!jobId) return;
    try {
      setAction("checking-in");
      const location = await getCurrentLocation();
      await attendanceService.checkIn(Number(jobId), {
        latitude: location.latitude,
        longitude: location.longitude,
      });
      toast.success("Check-in successful");
      await refreshAttendance();
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Failed to mark attendance";
      if (message.includes("200 meters")) {
        toast.error(
          "You are not at the work location. Move within 200 meters and try again.",
        );
      } else {
        toast.error(message);
      }
    } finally {
      setAction(undefined);
    }
  };

  const handleCheckOut = async () => {
    if (!jobId) return;
    try {
      setAction("checking-out");
      const location = await getCurrentLocation();
      await attendanceService.checkOut(Number(jobId), {
        latitude: location.latitude,
        longitude: location.longitude,
      });
      toast.success("Check-out successful. Waiting for employer review.");
      await refreshAttendance();
    } catch (error: any) {
      const message = error?.response?.data?.message || "Failed to check out";
      if (message.includes("200 meters")) {
        toast.error("You must be at the work location to check out.");
      } else {
        toast.error(message);
      }
    } finally {
      setAction(undefined);
    }
  };

  // 👇 CLEAN SERVICE CALL FOR PAYMENT WRITING
  const handleConfirmPaymentReceived = async () => {
    if (!payment?.id) return;
    try {
      setAction("confirming-payment");

      // The service unwraps response.data.data directly now
      const updatedPayment = await paymentService.confirmPaymentReceived(
        payment.id,
      );

      toast.success("Payment receipt confirmed successfully!");

      // 👇 Use the absolute truth directly from the database response
      setPayment(updatedPayment);
    } catch (err) {
      toast.error(getErrorMessage(err) || "Failed to confirm payment");
      console.error(err);
    } finally {
      setAction(undefined);
    }
  };

  const handleRaiseDispute = async () => {
    if (!jobId || !attendance) return;

    const reason = window.prompt("Enter dispute reason");
    if (!reason?.trim()) return;

    const description = window.prompt("Enter dispute description") ?? "";
    if (!description.trim()) {
      setError("Dispute description is required");
      return;
    }

    try {
      setAction("raising-dispute");
      await disputeService.createDispute({
        jobId: Number(jobId),
        attendanceId: attendance.id,
        reason: reason.trim(),
        description: description.trim(),
      });
      toast.success("Dispute raised successfully");
    } catch (err) {
      setError("Failed to create dispute");
      console.error(err);
    } finally {
      setAction(undefined);
    }
  };

  const hasCheckedIn = attendance?.checkInTime;
  const hasCheckedOut = attendance?.checkOutTime;
  const attendanceStatus = attendance?.status;
  const canRateEmployer = Boolean(
    hasCheckedIn ||
      hasCheckedOut ||
      attendanceStatus === "APPROVED" ||
      attendanceStatus === "COMPLETED" ||
      payment?.status === "COMPLETED",
  );

  useEffect(() => {
    if (canRateEmployer && job?.employer?.userId && !hasAutoOpenedRatingPrompt) {
      setShowEmployerRatingForm(true);
      setHasAutoOpenedRatingPrompt(true);
    }
  }, [canRateEmployer, job?.employer?.userId, hasAutoOpenedRatingPrompt]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="rounded-panel bg-white p-5 text-center shadow-panel">
        <p className="text-slate-600">Job not found</p>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      <PageHeader title={job.title} subtitle={job.category} />

      {error && (
        <div className="rounded bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Job Details Card */}
      <div className="rounded-panel bg-white p-5 shadow-panel">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-slate-600">Job Status</p>
            <StatusBadge status={job.status} />
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-600">Wage</p>
            <p className="text-2xl font-bold text-slate-900">₹{job.wage}</p>
          </div>
        </div>

        <hr className="my-4" />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-600">Job Date</p>
            <p className="text-sm font-medium text-slate-900">{job.jobDate}</p>
          </div>
          <div>
            <p className="text-xs text-slate-600">Required Workers</p>
            <p className="text-sm font-medium text-slate-900">
              {job.requiredWorkers}
            </p>
          </div>
        </div>

        <hr className="my-4" />

        <div>
          <p className="text-sm font-medium text-slate-900">Description</p>
          <p className="mt-2 text-sm text-slate-700">
            {cleanDescription(job.description)}
          </p>
        </div>

        {extractLocation(job.description) && (
          <>
            <hr className="my-4" />
            <div>
              <p className="text-sm font-medium text-slate-900">Location</p>
              <p className="mt-2 text-sm text-slate-700">
                {extractLocation(job.description)}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Application Status */}
      {application && (
        <div className="rounded-panel bg-blue-50 p-4 shadow-panel">
          <p className="text-sm font-medium text-blue-900 mb-1">
            Application Status
          </p>
          <StatusBadge status={application.status} />
        </div>
      )}


      {application?.status === "COMPLETED" && (
        <div className="space-y-4 rounded-panel bg-white p-5 shadow-panel">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Employer Review
              </p>
              <h2 className="text-lg font-semibold text-slate-900">
                Rate {job.employer.name}
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Share feedback about the employer's behavior, communication,
                and job handling.
              </p>
            </div>
            {!showEmployerRatingForm && (
              <Button
                variant="secondary"
                onClick={() => setShowEmployerRatingForm(true)}
              >
                Rate Employer
              </Button>
            )}
          </div>

          <RatingPopup
            open={showEmployerRatingForm}
            title={`Rate ${job.employer.name}`}
            subtitle="Share feedback about the employer's behavior, communication, and job handling."
            jobId={Number(jobId)}
            toUserId={job.employer.userId}
            onClose={() => setShowEmployerRatingForm(false)}
            onSuccess={() => {
              toast.success("Rating submitted successfully");
              setShowEmployerRatingForm(false);
            }}
          />
        </div>
      )}









      {/* Attendance Metrics Block */}
      {application?.status === "SELECTED" && attendance && (
        <div className="rounded-panel bg-purple-50 p-4 shadow-panel">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-purple-900">Attendance</p>
            <StatusBadge status={attendanceStatus} />
          </div>
          {hasCheckedIn && (
            <p className="text-sm text-purple-700">
              Check-in: {new Date(attendance.checkInTime).toLocaleTimeString()}
            </p>
          )}
          {hasCheckedOut && (
            <p className="text-sm text-purple-700">
              Check-out:{" "}
              {new Date(attendance.checkOutTime).toLocaleTimeString()}
            </p>
          )}
          {attendance?.totalHours && (
            <p className="text-sm text-purple-700">
              Hours worked: {attendance.totalHours}
            </p>
          )}
        </div>
      )}

      {/* Action Buttons Interface */}
      <div className="space-y-3">
        {!application && (
          <Button
            fullWidth
            onClick={handleApply}
            loading={action === "applying"}
          >
            Apply for Job
          </Button>
        )}

        {application?.status === "APPLIED" && (
          <div className="rounded-panel bg-yellow-50 p-4 text-center">
            <p className="text-sm font-medium text-yellow-900">
              Application pending
            </p>
          </div>
        )}

        {application?.status === "REJECTED" && (
          <div className="rounded-panel bg-red-50 p-4 text-center">
            <p className="text-sm font-medium text-red-900">
              Application rejected
            </p>
          </div>
        )}

        {application?.status === "SELECTED" && !attendance && (
          <Button
            fullWidth
            onClick={handleCheckIn}
            loading={action === "checking-in"}
            className="bg-green-600 hover:bg-green-700"
          >
            Check In
          </Button>
        )}

        {attendance?.status === "CHECKED_IN" && (
          <Button
            fullWidth
            onClick={handleCheckOut}
            loading={action === "checking-out"}
            className="bg-orange-600 hover:bg-orange-700"
          >
            Check Out
          </Button>
        )}

        {attendance?.status === "PENDING_REVIEW" && (
          <Button fullWidth variant="secondary" disabled>
            Waiting For Employer Review
          </Button>
        )}

        {/* 👇 CLEAN PAYMENTS VIEW UI PANEL */}
        {attendance?.status === "APPROVED" && (
          <div className="space-y-3 rounded-panel bg-green-50 p-4 border border-green-200 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-green-900">
                Work Approved 🎉
              </p>
              {/* Fallback to dynamic status tracking from backend payment row */}
              <StatusBadge status={payment?.status ?? "PENDING"} />
            </div>
            <p className="text-xs text-green-700">
              Your attendance was approved. Pay out wage structure:{" "}
              <strong>₹{job.wage}</strong>
            </p>

            {/* 👇 Check both possible flags depending on your database schema sync */}
            {payment?.status === "COMPLETED" || payment?.workerConfirmed ? (
              <div className="text-center py-2 text-sm font-semibold text-green-800 bg-green-100 rounded-lg">
                ✓ Payment Received Confirmed
              </div>
            ) : (
              <Button
                fullWidth
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={handleConfirmPaymentReceived}
                loading={action === "confirming-payment"}
              >
                Mark Payment as Received
              </Button>
            )}
          </div>
        )}

        {attendance?.status === "ISSUE_REPORTED" && (
          <>
            <Button fullWidth variant="secondary" disabled>
              Issue Reported
            </Button>
            <Button
              fullWidth
              variant="outline"
              onClick={handleRaiseDispute}
              loading={action === "raising-dispute"}
            >
              Raise Dispute
            </Button>
          </>
        )}
      </div>

      



      

      
    </div>
  );
};
