import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "../../components/common/Button";
import { PageHeader } from "../../components/common/PageHeader";
import { jobApplicationService } from "../../modules/jobApplication/jobApplication.service";

export const AssignedJobsPage = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const data = await jobApplicationService.getMyAssignedJobs();
        setJobs(data);
      } catch (err) {
        setError("Failed to load jobs");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

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
          {jobs.map((job) => (
            <div
              key={job.id}
              className="flex items-center justify-between rounded-panel bg-white p-4 shadow-panel"
            >
              <div className="flex-1">
                <p className="font-medium text-slate-900">{job.job.title}</p>
                <p className="text-xs text-slate-600">{job.job.category}</p>
                <p className="text-sm font-semibold text-slate-900 mt-2">
                  ₹{job.job.wage}
                </p>
              </div>
              <Button
                onClick={() => navigate(`/jobs/open/${job.jobId}`)}
                className="text-xs"
              >
                Check In
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
