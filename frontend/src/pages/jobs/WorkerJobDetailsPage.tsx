import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { Button } from "../../components/common/Button";
import { RatingForm } from "../../components/common/RatingForm";
import { PageHeader } from "../../components/common/PageHeader";
import { StatusBadge } from "../../components/common/StatusBadge";
import { jobService } from "../../modules/job/job.service";
import { jobApplicationService } from "../../modules/jobApplication/jobApplication.service";
import { attendanceService } from "../../modules/attendance/attendance.service";
import { getErrorMessage } from "../../utils/helpers";

const extractLocation = (description?: string | null) => {
  if (!description) {
    return undefined;
  }

  const match = description.match(/Location:\s*([^\n]+)/i);
  return match?.[1]?.trim();
};

const cleanDescription = (description?: string | null) =>
  (description ?? "").replace(/\n*\n*Location:\s*[^\n]+/i, "").trim();

const getSelectedWorkers = (job: any) =>
  (job?.jobApplications ?? []).filter(
    (application: any) => application.status === "SELECTED",
  );

export const WorkerJobDetailsPage = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const [job, setJob] = useState<any>(null);
  const [application, setApplication] = useState<any>(null);
  const [attendance, setAttendance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [action, setAction] = useState<string>();
  const [showEmployerRatingForm, setShowEmployerRatingForm] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!jobId) return;
      try {
        setLoading(true);
        const jobData = await jobService.getJobById(Number(jobId));
        setJob(jobData);

        // Try to get user's application
        try {
          const apps = await jobApplicationService.getMyApplications();
          const userApp = apps.find((a: any) => a.jobId === Number(jobId));
          setApplication(userApp);

          // If selected, try to get the worker's own attendance record for this job
          if (userApp?.status === "SELECTED") {
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

  const handleCheckIn = async () => {
    if (!jobId) return;
    try {
      setAction("checking-in");
      await attendanceService.checkIn(Number(jobId));
      const attendanceHistory = await attendanceService.getMyAttendance();
      const jobAttendance = attendanceHistory.find(
        (record: any) => record.jobId === Number(jobId),
      );
      setAttendance(jobAttendance ?? null);
    } catch (err) {
      setError(getErrorMessage(err));
      console.error(err);
    } finally {
      setAction(undefined);
    }
  };

  const handleCheckOut = async () => {
    if (!jobId) return;
    try {
      setAction("checking-out");
      await attendanceService.checkOut(Number(jobId));
      const attendanceHistory = await attendanceService.getMyAttendance();
      const jobAttendance = attendanceHistory.find(
        (record: any) => record.jobId === Number(jobId),
      );
      setAttendance(jobAttendance ?? null);
    } catch (err) {
      setError(getErrorMessage(err));
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

  if (!job) {
    return (
      <div className="rounded-panel bg-white p-5 text-center shadow-panel">
        <p className="text-slate-600">Job not found</p>
      </div>
    );
  }

  const hasCheckedIn = attendance?.checkInTime;
  const hasCheckedOut = attendance?.checkOutTime;
  const canRateEmployer = Boolean(
    hasCheckedIn || hasCheckedOut || application?.status === "COMPLETED",
  );

  return (
    <div className="space-y-6">
      <PageHeader title={job.title} subtitle={job.category} />

      {error && (
        <div className="rounded bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Job Details */}
      <div className="rounded-panel bg-white p-5 shadow-panel">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-slate-600">Job Status</p>
            <StatusBadge status={job.status} />
          </div>
          <div className="text-right space-y-2">
            <div>
              <p className="text-sm text-slate-600">Employer Rating</p>
              <p className="text-base font-semibold text-slate-900">
                {job.employer?.rating > 0
                  ? `${Number(job.employer.rating).toFixed(1)} ⭐`
                  : "No ratings"}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Wage</p>
              <p className="text-2xl font-bold text-slate-900">₹{job.wage}</p>
            </div>
          </div>
        </div>

        <hr className="my-4" />

        <div>
          <p className="text-sm font-medium text-slate-900">Employer</p>
          <p className="mt-1 text-sm text-slate-700">{job.employer?.name}</p>
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
          <p className="text-sm font-medium text-blue-900">
            Application Status
          </p>
          <StatusBadge status={application.status} />
        </div>
      )}

      {getSelectedWorkers(job).length > 0 && (
        <div className="rounded-panel bg-white p-5 shadow-panel">
          <p className="text-sm font-medium text-slate-900 mb-3">
            Selected Workers
          </p>
          <div className="space-y-3">
            {getSelectedWorkers(job).map((selectedApplication: any) => (
              <div
                key={selectedApplication.id}
                className="rounded-lg border border-slate-200 bg-slate-50 p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900">
                      {selectedApplication.worker?.name ?? "Worker"}
                    </p>
                    <p className="text-sm text-slate-600">
                      Rating: {selectedApplication.worker?.rating ?? 0}
                    </p>
                    <p className="text-xs text-slate-500">
                      Jobs completed:{" "}
                      {selectedApplication.worker?.totalJobsCompleted ?? 0}
                    </p>
                  </div>
                  <StatusBadge status={selectedApplication.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attendance Status */}
      {application?.status === "SELECTED" && attendance && (
        <div className="rounded-panel bg-purple-50 p-4 shadow-panel">
          <p className="text-sm font-medium text-purple-900 mb-2">Attendance</p>
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
        </div>
      )}

      {/* Action Buttons */}
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
            <p className="text-sm text-yellow-900 font-medium">
              Application pending
            </p>
          </div>
        )}

        {application?.status === "REJECTED" && (
          <div className="rounded-panel bg-red-50 p-4 text-center">
            <p className="text-sm text-red-900 font-medium">
              Application rejected
            </p>
          </div>
        )}

        {application?.status === "SELECTED" && !hasCheckedIn && (
          <Button
            fullWidth
            onClick={handleCheckIn}
            loading={action === "checking-in"}
            className="bg-green-600 hover:bg-green-700"
          >
            Check In
          </Button>
        )}

        {application?.status === "SELECTED" &&
          hasCheckedIn &&
          !hasCheckedOut && (
            <Button
              fullWidth
              onClick={handleCheckOut}
              loading={action === "checking-out"}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Check Out
            </Button>
          )}

        {application?.status === "SELECTED" && hasCheckedOut && (
          <Button fullWidth variant="secondary" disabled>
            Attendance Complete
          </Button>
        )}
      </div>

      {canRateEmployer && job?.employer?.userId && (
        <div className="rounded-panel bg-white p-5 shadow-panel space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">Employer Review</p>
              <h2 className="text-lg font-semibold text-slate-900">
                Rate {job.employer.name}
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Share feedback about behavior, payment, and job coordination.
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

          {showEmployerRatingForm && (
            <RatingForm
              jobId={Number(jobId)}
              toUserId={job.employer.userId}
              onSuccess={() => setShowEmployerRatingForm(false)}
              onCancel={() => setShowEmployerRatingForm(false)}
            />
          )}
        </div>
      )}
    </div>
  );
};
