import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { JobCard } from "../../components/common/JobCard";
import { PageHeader } from "../../components/common/PageHeader";
import { Select } from "../../components/common/Select";
import { jobService } from "../../modules/job/job.service";

export const BrowseJobsPage = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [category, setCategory] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const data = await jobService.getOpenJobs({
          category: category || undefined,
        });
        setJobs(data);
      } catch (err) {
        setError("Failed to load jobs");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [category]);

  const categories = [
    { label: "All Categories", value: "" },
    { label: "Construction", value: "Construction" },
    { label: "Repairs", value: "Repairs" },
    { label: "Cleaning", value: "Cleaning" },
    { label: "Plumbing", value: "Plumbing" },
    { label: "Electrical", value: "Electrical" },
    { label: "Carpentry", value: "Carpentry" },
    { label: "Painting", value: "Painting" },
    { label: "Masonry", value: "Masonry" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Find Work" subtitle="Browse available jobs" />

      {error && (
        <div className="rounded bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <Select
        label="Filter by Category"
        options={categories}
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />

      {jobs.length === 0 ? (
        <div className="rounded-panel bg-white p-8 text-center shadow-panel">
          <p className="text-slate-600">No jobs available</p>
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
              employerName={
                job.employerName || job.employer?.name || "Employer"
              }
              onViewDetails={(jobId) => navigate(`/jobs/open/${jobId}`)}
              onApply={(jobId) => navigate(`/jobs/open/${jobId}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
