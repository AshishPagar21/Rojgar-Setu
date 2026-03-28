import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { Button } from "../../components/common/Button";
import { JobCard } from "../../components/common/JobCard";
import { PageHeader } from "../../components/common/PageHeader";
import { jobService } from "../../modules/job/job.service";

export const MyJobsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const data = await jobService.getMyJobs();
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
        <p className="text-slate-600">{t("common.loading")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="My Jobs" subtitle="Manage your job postings" />

      <Button
        fullWidth
        onClick={() => navigate("/jobs/create")}
        className="bg-blue-600 hover:bg-blue-700"
      >
        Post New Job
      </Button>

      {error && (
        <div className="rounded bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-panel bg-white p-8 text-center shadow-panel">
          <p className="text-slate-600">No jobs posted yet</p>
          <Button
            onClick={() => navigate("/jobs/create")}
            variant="secondary"
            className="mt-4"
          >
            Post Your First Job
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              id={job.id}
              title={job.title}
              description={job.description}
              category={job.category}
              wage={job.wage}
              jobDate={job.jobDate}
              requiredWorkers={job.requiredWorkers}
              status={job.status}
              employerName={job.employerName || job.employer?.name || "You"}
              onViewDetails={(jobId) => navigate(`/jobs/${jobId}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
