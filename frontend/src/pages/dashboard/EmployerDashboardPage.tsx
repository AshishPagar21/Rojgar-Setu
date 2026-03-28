import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { Button } from "../../components/common/Button";
import { PageHeader } from "../../components/common/PageHeader";
import { useAuth } from "../../hooks/useAuth";
import { employerService } from "../../modules/employer/employer.service";

interface DashboardStats {
  totalJobs: number;
  completedJobs: number;
  openJobs: number;
  assignedJobs: number;
}

export const EmployerDashboardPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentJobs, setRecentJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const dashboard = await employerService.getDashboard();
        setStats(dashboard.stats);
        setRecentJobs(dashboard.recentJobs || []);
      } catch (err) {
        setError("Failed to load dashboard");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
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
      <PageHeader
        title={t("dashboard.employerTitle")}
        subtitle={t("dashboard.welcome", {
          name: profile?.employer?.name || user?.mobileNumber || "",
        })}
      />

      {error && (
        <div className="rounded bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-panel bg-blue-50 p-4 shadow-panel">
            <p className="text-xs text-slate-600">{t("dashboard.totalJobs")}</p>
            <p className="text-2xl font-bold text-blue-600">
              {stats.totalJobs}
            </p>
          </div>
          <div className="rounded-panel bg-green-50 p-4 shadow-panel">
            <p className="text-xs text-slate-600">
              {t("dashboard.completedJobs")}
            </p>
            <p className="text-2xl font-bold text-green-600">
              {stats.completedJobs}
            </p>
          </div>
          <div className="rounded-panel bg-orange-50 p-4 shadow-panel">
            <p className="text-xs text-slate-600">{t("dashboard.openJobs")}</p>
            <p className="text-2xl font-bold text-orange-600">
              {stats.openJobs}
            </p>
          </div>
          <div className="rounded-panel bg-purple-50 p-4 shadow-panel">
            <p className="text-xs text-slate-600">
              {t("dashboard.assignedJobs")}
            </p>
            <p className="text-2xl font-bold text-purple-600">
              {stats.assignedJobs}
            </p>
          </div>
        </div>
      )}

      {/* CTA Button */}
      <Button
        fullWidth
        onClick={() => navigate("/jobs/create")}
        className="bg-blue-600 hover:bg-blue-700"
      >
        {t("dashboard.postNewJob")}
      </Button>

      {/* Recent Jobs */}
      <div className="rounded-panel bg-white p-5 shadow-panel">
        <h3 className="mb-4 font-semibold text-slate-900">
          {t("dashboard.recentJobs")}
        </h3>
        {recentJobs.length === 0 ? (
          <p className="text-center text-slate-500">{t("dashboard.noJobs")}</p>
        ) : (
          <div className="space-y-3">
            {recentJobs.map((job) => (
              <div
                key={job.id}
                className="flex cursor-pointer items-between justify-between rounded border border-slate-200 p-3 hover:bg-slate-50"
                onClick={() => navigate(`/jobs/${job.id}`)}
              >
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{job.title}</p>
                  <p className="text-xs text-slate-600">{job.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">
                    ₹{job.wage}
                  </p>
                  <p className="text-xs text-slate-500">{job.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* View All Jobs Link */}
      <Button
        fullWidth
        variant="secondary"
        onClick={() => navigate("/jobs/my")}
      >
        {t("dashboard.viewAllJobs")}
      </Button>
    </div>
  );
};
