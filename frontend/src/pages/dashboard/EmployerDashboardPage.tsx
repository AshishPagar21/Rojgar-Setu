import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { Button } from "../../components/common/Button";
import { useAuth } from "../../hooks/useAuth";
import { employerService } from "../../modules/employer/employer.service";
import type {
  EmployerDashboardData,
  EmployerDashboardRecentJob,
} from "../../modules/employer/employer.types";

const numberFormat = new Intl.NumberFormat();

const formatDate = (value?: string) => {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

const getStatusLabel = (status: string, t: (key: string) => string) => {
  switch (status) {
    case "OPEN":
      return t("dashboard.statusOpen");
    case "ASSIGNED":
      return t("dashboard.statusAssigned");
    case "COMPLETED":
      return t("dashboard.statusCompleted");
    case "SELECTED":
      return t("dashboard.statusSelected");
    case "PENDING":
      return t("dashboard.statusPending");
    case "REJECTED":
      return t("dashboard.statusRejected");
    default:
      return status;
  }
};

const getStatusTone = (status: string) => {
  switch (status) {
    case "OPEN":
      return "bg-emerald-50 text-emerald-700";
    case "ASSIGNED":
      return "bg-amber-50 text-amber-700";
    case "COMPLETED":
      return "bg-blue-50 text-blue-700";
    case "SELECTED":
      return "bg-brand-50 text-brand-700";
    case "PENDING":
      return "bg-slate-100 text-slate-700";
    case "REJECTED":
      return "bg-rose-50 text-rose-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
};

const StatCard = ({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone: string;
}) => {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className={`mb-3 h-2 w-14 rounded-full ${tone}`} />
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
};

export const EmployerDashboardPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [dashboard, setDashboard] = useState<EmployerDashboardData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const response =
          (await employerService.getDashboard()) as EmployerDashboardData;
        setDashboard(response);
      } catch (err) {
        setError(t("dashboard.failedToLoadDashboard"));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [t]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="rounded-2xl bg-white px-5 py-4 text-sm font-medium text-slate-600 shadow-sm">
          {t("dashboard.loadingDashboard")}
        </div>
      </div>
    );
  }

  const recentJobs: EmployerDashboardRecentJob[] = dashboard?.recentJobs || [];
  const welcomeName = profile?.employer?.name || user?.mobileNumber || "";

  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-amber-500 p-5 text-white shadow-lg shadow-brand-100">
        <p className="text-sm font-medium text-white/90">
          {t("dashboard.atAGlance")}
        </p>
        <h1 className="mt-1 text-2xl font-bold">
          {t("dashboard.welcome", { name: welcomeName })}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/90">
          {t("dashboard.employerText")}
        </p>
        <div className="mt-4 inline-flex rounded-full bg-white/15 px-3 py-1 text-sm font-medium text-white">
          {t("dashboard.employerNextStep")}
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      {dashboard && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label={t("dashboard.totalJobsPosted")}
            value={numberFormat.format(dashboard.totalJobsPosted)}
            tone="bg-brand-500"
          />
          <StatCard
            label={t("dashboard.openJobs")}
            value={numberFormat.format(dashboard.openJobsCount)}
            tone="bg-emerald-500"
          />
          <StatCard
            label={t("dashboard.assignedJobs")}
            value={numberFormat.format(dashboard.assignedJobsCount)}
            tone="bg-amber-500"
          />
          <StatCard
            label={t("dashboard.completedJobs")}
            value={numberFormat.format(dashboard.completedJobsCount)}
            tone="bg-sky-500"
          />
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <Button fullWidth onClick={() => navigate("/jobs/create")}>
          {t("dashboard.postNewJob")}
        </Button>
        <Button
          fullWidth
          variant="secondary"
          onClick={() => navigate("/jobs/my")}
        >
          {t("dashboard.viewAllJobs")}
        </Button>
      </div>

      <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">
              {t("dashboard.recentJobs")}
            </p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900">
              {t("dashboard.employerTitle")}
            </h2>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            {recentJobs.length}
          </span>
        </div>

        {recentJobs.length === 0 ? (
          <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
            {t("dashboard.noJobs")}
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {recentJobs.map((job) => (
              <div
                key={job.id}
                className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4 transition hover:border-brand-200 hover:bg-brand-50/40"
                onClick={() => navigate(`/jobs/${job.id}`)}
              >
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">{job.title}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {job.category || t("dashboard.browseJobs")}
                  </p>
                  {job.createdAt ? (
                    <p className="mt-1 text-xs text-slate-400">
                      {t("dashboard.postedOn", {
                        date: formatDate(job.createdAt),
                      })}
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2 text-right">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusTone(
                      job.status,
                    )}`}
                  >
                    {getStatusLabel(job.status, t)}
                  </span>
                  {job.wage != null ? (
                    <p className="text-sm font-semibold text-slate-900">
                      Rs. {numberFormat.format(job.wage)}
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
