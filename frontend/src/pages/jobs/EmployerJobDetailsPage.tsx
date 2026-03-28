import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Button } from "../../components/common/Button";
import { PageHeader } from "../../components/common/PageHeader";
import { StatusBadge } from "../../components/common/StatusBadge";
import { jobService } from "../../modules/job/job.service";
import { jobApplicationService } from "../../modules/jobApplication/jobApplication.service";

export const EmployerJobDetailsPage = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<any>(null);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [action, setAction] = useState<string>();

  useEffect(() => {
    const fetchJob = async () => {
      if (!jobId) return;
      try {
        setLoading(true);
        const jobData = await jobService.getJobById(Number(jobId));
        setJob(jobData);

        try {
          const applicantData = await jobApplicationService.getJobApplicants(
            Number(jobId),
          );
          setApplicants(applicantData);
        } catch {
          // No applicants yet
        }
      } catch (err) {
        setError("Failed to load job details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
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

      {/* Job Details */}
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
          <p className="mt-2 text-sm text-slate-700">{job.description}</p>
        </div>

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
      </div>

      {/* Action Buttons */}
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
