import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "../../components/common/Button";
import { useAuth } from "../../hooks/useAuth";
import { adminService } from "../../modules/admin/admin.service";
import type { AdminDashboardData } from "../../modules/employer/employer.types";

export const AdminDashboardPage = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [dashboard, setDashboard] = useState<AdminDashboardData | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await adminService.getDashboard();
        setDashboard(response);
      } catch (error) {
        console.error(error);
      }
    };

    loadDashboard();
  }, []);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5">
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-amber-500 p-5 text-white shadow-lg shadow-brand-100">
        <p className="text-sm font-medium text-white/90">
          {t("dashboard.atAGlance")}
        </p>
        <h1 className="mt-1 text-2xl font-bold">{t("dashboard.adminTitle")}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/90">
          {t("dashboard.welcome", {
            name: user?.mobileNumber || t("dashboard.adminFallback"),
          })}
        </p>
        <div className="mt-4 inline-flex rounded-full bg-white/15 px-3 py-1 text-sm font-medium text-white">
          {t("dashboard.adminNextStep")}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
        <p className="text-sm font-medium text-slate-500">
          {t("dashboard.adminText")}
        </p>
        <p className="mt-2 text-base leading-7 text-slate-700">
          {t("dashboard.adminNextStep")}
        </p>
        {dashboard ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase text-slate-500">Total Jobs</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {dashboard.totalJobs}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase text-slate-500">Active Workers</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {dashboard.activeWorkers}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase text-slate-500">
                Active Employers
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {dashboard.activeEmployers}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase text-slate-500">Completed Jobs</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {dashboard.completedJobs}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase text-slate-500">
                Pending Disputes
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {dashboard.pendingDisputes}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase text-slate-500">
                Payments Pending
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {dashboard.paymentsPending}
              </p>
            </div>
          </div>
        ) : null}
        <div className="mt-5">
          <Button fullWidth onClick={logout}>
            {t("common.logout")}
          </Button>
        </div>
      </div>

      {dashboard ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">
              Jobs per Day
            </h3>
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              {dashboard.charts.jobsPerDay.map((item) => (
                <div
                  key={item.date}
                  className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"
                >
                  <span>{item.date}</span>
                  <span className="font-semibold text-slate-900">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">
              Registrations
            </h3>
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              {dashboard.charts.registrations.map((item) => (
                <div
                  key={item.date}
                  className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"
                >
                  <span>{item.date}</span>
                  <span className="font-semibold text-slate-900">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
