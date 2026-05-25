import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Button } from "../../components/common/Button";
import { LanguageSwitcher } from "../../components/common/LanguageSwitcher";
import { PageHeader } from "../../components/common/PageHeader";
import { useAuth } from "../../hooks/useAuth";
import { routePaths } from "../../routes/routePaths";

const roleLabel: Record<string, string> = {
  ADMIN: "Admin",
  EMPLOYER: "Employer",
  WORKER: "Worker",
};

export const ProfilePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const name = useMemo(() => {
    if (profile?.employer?.name) return profile.employer.name;
    if (profile?.worker?.name) return profile.worker.name;
    return t("common.notAvailable");
  }, [profile]);

  const role = user?.role ? roleLabel[user.role] : t("common.notAvailable");

  const quickActions = useMemo(() => {
    if (user?.role === "EMPLOYER") {
      return [
        { label: t("common.postJob"), onClick: () => navigate("/jobs/create") },
        { label: t("common.myJobs"), onClick: () => navigate("/jobs/my") },
      ];
    }

    if (user?.role === "WORKER") {
      return [
        { label: t("common.findWork"), onClick: () => navigate("/jobs/open") },
        {
          label: t("common.myApplications"),
          onClick: () => navigate("/applications/my"),
        },
      ];
    }

    return [
      {
        label: t("common.dashboard"),
        onClick: () => navigate(routePaths.dashboardAdmin),
      },
    ];
  }, [navigate, t, user?.role]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("common.profile")}
        subtitle={t("common.accountDetails")}
      />

      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-amber-500 p-5 text-white shadow-lg shadow-brand-100">
        <p className="text-sm font-medium text-white/90">
          {t("common.account")}
        </p>
        <h2 className="mt-1 text-2xl font-bold">{name}</h2>
        <p className="mt-2 text-sm text-white/90">
          {t("common.mobileNumber")}:{" "}
          {user?.mobileNumber ?? t("common.notAvailable")}
        </p>
        <p className="mt-1 text-sm text-white/90">
          {t("common.role")}: {role}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-900">
            {t("common.quickActions")}
          </p>
          <div className="mt-4 space-y-2">
            {quickActions.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={action.onClick}
                className="block w-full rounded-2xl border border-slate-200 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:border-brand-200 hover:bg-brand-50/40"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-900">
            {t("common.settings")}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {t("common.languageSettingHint")}
          </p>
          <div className="mt-4 rounded-2xl bg-slate-50 p-3">
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-slate-500">{t("common.name")}</p>
            <p className="text-sm font-semibold text-slate-900">{name}</p>
          </div>

          <div>
            <p className="text-xs text-slate-500">{t("common.mobileNumber")}</p>
            <p className="text-sm font-semibold text-slate-900">
              {user?.mobileNumber ?? t("common.notAvailable")}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">{t("common.role")}</p>
            <p className="text-sm font-semibold text-slate-900">{role}</p>
          </div>

          <div>
            <p className="text-xs text-slate-500">
              {t("common.accountStatus")}
            </p>
            <p className="text-sm font-semibold text-slate-900">
              {user?.isActive ? t("common.active") : t("common.inactive")}
            </p>
          </div>
        </div>
      </div>

      <Button
        fullWidth
        variant="outline"
        onClick={() => navigate(routePaths.root)}
      >
        {t("common.goHome")}
      </Button>
    </div>
  );
};
