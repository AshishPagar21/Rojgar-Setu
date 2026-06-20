import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Button } from "../../components/common/Button";
import { PageHeader } from "../../components/common/PageHeader";
import { StatusBadge } from "../../components/common/StatusBadge";
import { attendanceService } from "../../modules/attendance/attendance.service";
import { disputeService } from "../../modules/dispute/dispute.service";
import { jobService } from "../../modules/job/job.service";
import { jobApplicationService } from "../../modules/jobApplication/jobApplication.service";
import { socketService } from "../../services/socket.service";

const extractLocation = (description: string) => {
  const match = description.match(/Location:\s*([^\n]+)/i);
  return match?.[1]?.trim();
};

const cleanDescription = (description: string) =>
  description.replace(/\n*\n*Location:\s*[^\n]+/i, "").trim();

const getSelectedApplicants = (applicants: any[]) =>
  applicants.filter((applicant) => applicant.status === "SELECTED");

export const EmployerJobDetailsPage = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<any>(null);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [action, setAction] = useState<string>();

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
  };

  useEffect(() => {
    const fetchJob = async () => {
      if (!jobId) return;
      try {
        setLoading(true);
        await refreshData(Number(jobId));
      } catch (err) {
        setError("Failed to load job details");
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
      setError("Failed to cancel job");
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
      setError("Failed to complete job");
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
      setError("Failed to approve attendance");
      console.error(err);
    } finally {
      setAction(undefined);
    }
  };

  const handleReportIssue = async (attendanceId: number) => {
    if (!jobId) return;

    const reason = window.prompt("Enter issue reason");
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
      setError("Failed to report attendance issue");
      console.error(err);
    } finally {
      setAction(undefined);
    }
  };

  const handleRaiseDispute = async (attendanceId: number) => {
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
      setAction(`dispute-${attendanceId}`);
      await disputeService.createDispute({
        jobId: Number(jobId),
        attendanceId,
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

  const selectedApplicants = getSelectedApplicants(applicants);

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

      <div className="rounded-panel bg-white p-5 shadow-panel">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-slate-600">Status</p>
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

        <hr className="my-4" />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-600">Applied</p>
            <p className="text-2xl font-bold text-slate-900">
              {applicants.filter((a) => a.status === "APPLIED").length}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-600">Selected</p>
            <p className="text-2xl font-bold text-slate-900">
              {applicants.filter((a) => a.status === "SELECTED").length}
            </p>
          </div>
        </div>

        {selectedApplicants.length > 0 && (
          <>
            <hr className="my-4" />
            <div>
              <p className="mb-3 text-sm font-medium text-slate-900">
                Selected Workers Attendance
              </p>
              <div className="space-y-3">
                {selectedApplicants.map((selectedApplicant) => {
                  const attendance = attendanceRecords.find(
                    (record) => record.workerId === selectedApplicant.workerId,
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
                              "Worker"}
                          </p>
                          <p className="text-sm text-slate-600">
                            Reliability:{" "}
                            {selectedApplicant.worker?.reliabilityScore ?? 0}
                          </p>
                          <p className="text-sm text-slate-600">
                            Check in:{" "}
                            {attendance?.checkInTime
                              ? new Date(
                                  attendance.checkInTime,
                                ).toLocaleTimeString()
                              : "Not marked"}
                          </p>
                          <p className="text-sm text-slate-600">
                            Check out:{" "}
                            {attendance?.checkOutTime
                              ? new Date(
                                  attendance.checkOutTime,
                                ).toLocaleTimeString()
                              : "Not marked"}
                          </p>
                          <p className="text-sm text-slate-600">
                            Hours worked: {attendance?.totalHours ?? "-"}
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
                          Approve
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
                          Report Issue
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
                          Raise Dispute
                        </Button>
                      </div>
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
              View Applicants ({applicants.length})
            </Button>
            <Button
              fullWidth
              variant="outline"
              onClick={handleCancel}
              loading={action === "canceling"}
            >
              Cancel Job
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
              View Payments
            </Button>
            <Button
              fullWidth
              variant="outline"
              onClick={handleComplete}
              loading={action === "completing"}
            >
              Mark Complete
            </Button>
          </>
        )}

        {job.status === "COMPLETED" && (
          <Button fullWidth variant="secondary" disabled>
            Job Completed
          </Button>
        )}
      </div>
    </div>
  );
};
