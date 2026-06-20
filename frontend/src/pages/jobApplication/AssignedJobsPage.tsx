import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "../../components/common/Button";
import { PageHeader } from "../../components/common/PageHeader";
import { StatusBadge } from "../../components/common/StatusBadge";
import { attendanceService } from "../../modules/attendance/attendance.service";
import { disputeService } from "../../modules/dispute/dispute.service";
import { jobApplicationService } from "../../modules/jobApplication/jobApplication.service";
import { useAuth } from "../../hooks/useAuth";
import { socketService } from "../../services/socket.service";
import { getCurrentLocation } from "../../utils/geolocation";

const getAttendanceForJob = (attendanceRecords: any[], jobId: number) =>
  attendanceRecords.find((record) => record.jobId === jobId);

export const AssignedJobsPage = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [action, setAction] = useState<string>();

  const loadData = async () => {
    const [jobData, attendanceData] = await Promise.all([
      jobApplicationService.getMyAssignedJobs(),
      attendanceService.getMyAttendance(),
    ]);

    setJobs(jobData);
    setAttendanceRecords(attendanceData);
  };

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        await loadData();
      } catch (err) {
        setError("Failed to load jobs");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  useEffect(() => {
    const refreshForWorkerEvents = async (payload: any) => {
      if (
        profile?.worker?.id &&
        payload.workerId &&
        payload.workerId !== profile.worker.id
      ) {
        return;
      }

      try {
        await loadData();
      } catch (err) {
        console.error(err);
      }
    };

    socketService.on("attendance:checked-in", refreshForWorkerEvents);
    socketService.on("attendance:checked-out", refreshForWorkerEvents);
    socketService.on("attendance:approved", refreshForWorkerEvents);
    socketService.on("attendance:issue-reported", refreshForWorkerEvents);

    return () => {
      socketService.off("attendance:checked-in", refreshForWorkerEvents);
      socketService.off("attendance:checked-out", refreshForWorkerEvents);
      socketService.off("attendance:approved", refreshForWorkerEvents);
      socketService.off("attendance:issue-reported", refreshForWorkerEvents);
    };
  }, [profile?.worker?.id]);

  const handleCheckIn = async (jobId: number) => {
    try {
      setAction(`check-in-${jobId}`);
      const location = await getCurrentLocation();
      await attendanceService.checkIn(jobId, location);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to check in");
      console.error(err);
    } finally {
      setAction(undefined);
    }
  };

  const handleCheckOut = async (jobId: number) => {
    try {
      setAction(`check-out-${jobId}`);
      const location = await getCurrentLocation();
      await attendanceService.checkOut(jobId, location);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to check out");
      console.error(err);
    } finally {
      setAction(undefined);
    }
  };

  const handleRaiseDispute = async (job: any, attendance: any) => {
    const reason = window.prompt("Enter dispute reason");
    if (!reason?.trim()) {
      return;
    }

    const description = window.prompt("Enter dispute description") ?? "";

    if (!description.trim()) {
      setError("Dispute description is required");
      return;
    }

    try {
      setAction(`dispute-${job.id}`);
      await disputeService.createDispute({
        jobId: job.id,
        attendanceId: attendance?.id,
        reason: reason.trim(),
        description: description.trim(),
      });
    } catch (err) {
      setError("Failed to create dispute");
      console.error(err);
    } finally {
      setAction(undefined);
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
        title="Assigned Jobs"
        subtitle="Jobs you've been selected for"
      />

      {error && (
        <div className="rounded bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {jobs.length === 0 ? (
        <div className="rounded-panel bg-white p-8 text-center shadow-panel">
          <p className="text-slate-600">No assigned jobs yet</p>
          <Button
            onClick={() => navigate("/jobs/open")}
            variant="secondary"
            className="mt-4"
          >
            Find Work
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => {
            const attendance = getAttendanceForJob(
              attendanceRecords,
              job.jobId,
            );
            const status = attendance?.status ?? "SELECTED";
            const canCheckIn = !attendance;
            const canCheckOut = attendance?.status === "CHECKED_IN";
            const canRaiseDispute = attendance?.status === "ISSUE_REPORTED";

            return (
              <div
                key={job.id}
                className="rounded-panel bg-white p-4 shadow-panel"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div>
                      <p className="font-medium text-slate-900">
                        {job.job.title}
                      </p>
                      <p className="text-xs text-slate-600">
                        {job.job.category}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">
                      ₹{job.job.wage}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={status} />
                      {attendance?.checkInTime ? (
                        <span className="text-xs text-slate-500">
                          Check in:{" "}
                          {new Date(
                            attendance.checkInTime,
                          ).toLocaleTimeString()}
                        </span>
                      ) : null}
                      {attendance?.checkOutTime ? (
                        <span className="text-xs text-slate-500">
                          Check out:{" "}
                          {new Date(
                            attendance.checkOutTime,
                          ).toLocaleTimeString()}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {canCheckIn ? (
                    <Button
                      onClick={() => handleCheckIn(job.jobId)}
                      loading={action === `check-in-${job.jobId}`}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Check In
                    </Button>
                  ) : null}

                  {canCheckOut ? (
                    <Button
                      onClick={() => handleCheckOut(job.jobId)}
                      loading={action === `check-out-${job.jobId}`}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      Check Out
                    </Button>
                  ) : null}

                  {attendance?.status === "PENDING_REVIEW" ? (
                    <Button variant="secondary" disabled>
                      Waiting For Review
                    </Button>
                  ) : null}

                  {attendance?.status === "APPROVED" ? (
                    <Button variant="secondary" disabled>
                      Approved
                    </Button>
                  ) : null}

                  {canRaiseDispute ? (
                    <Button
                      variant="outline"
                      onClick={() => handleRaiseDispute(job, attendance)}
                      loading={action === `dispute-${job.id}`}
                    >
                      Raise Dispute
                    </Button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
