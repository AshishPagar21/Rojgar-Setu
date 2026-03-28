import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "../../components/common/Button";
import { PageHeader } from "../../components/common/PageHeader";
import { StatusBadge } from "../../components/common/StatusBadge";
import { jobApplicationService } from "../../modules/jobApplication/jobApplication.service";

export const MyApplicationsPage = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const data = await jobApplicationService.getMyApplications();
        setApplications(data);
      } catch (err) {
        setError("Failed to load applications");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
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
        title="My Applications"
        subtitle="Track your job applications"
      />

      {error && (
        <div className="rounded bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {applications.length === 0 ? (
        <div className="rounded-panel bg-white p-8 text-center shadow-panel">
          <p className="text-slate-600">No applications yet</p>
          <Button
            onClick={() => navigate("/jobs/open")}
            variant="secondary"
            className="mt-4"
          >
            Browse Jobs
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => (
            <div
              key={app.id}
              className="flex items-center justify-between rounded-panel bg-white p-4 shadow-panel"
            >
              <div className="flex-1">
                <p className="font-medium text-slate-900">{app.job.title}</p>
                <p className="text-xs text-slate-600">
                  Applied on {new Date(app.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={app.status} />
                <Button
                  variant="secondary"
                  onClick={() => navigate(`/jobs/open/${app.jobId}`)}
                  className="text-xs"
                >
                  View
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
