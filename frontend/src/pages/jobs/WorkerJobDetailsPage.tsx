import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { Button } from "../../components/common/Button";
import { PageHeader } from "../../components/common/PageHeader";
import { StatusBadge } from "../../components/common/StatusBadge";
import { jobService } from "../../modules/job/job.service";
import { jobApplicationService } from "../../modules/jobApplication/jobApplication.service";
import { attendanceService } from "../../modules/attendance/attendance.service";
import { getErrorMessage } from "../../utils/helpers";

export const WorkerJobDetailsPage = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const [job, setJob] = useState<any>(null);
  const [application, setApplication] = useState<any>(null);
  const [attendance, setAttendance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [action, setAction] = useState<string>();

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

          // If selected, try to get attendance
          if (userApp?.status === "SELECTED") {
            try {
              const attendanceData = await attendanceService.getJobAttendance(
                Number(jobId),
              );
              setAttendance(attendanceData);
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
      const data = await attendanceService.getJobAttendance(Number(jobId));
      setAttendance(data);
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
      const data = await attendanceService.getJobAttendance(Number(jobId));
      setAttendance(data);
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
          <p className="mt-2 text-sm text-slate-700">{job.description}</p>
        </div>
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
    </div>
  );
};
