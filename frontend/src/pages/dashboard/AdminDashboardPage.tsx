import { useTranslation } from "react-i18next";

import { Button } from "../../components/common/Button";
import { useAuth } from "../../hooks/useAuth";

export const AdminDashboardPage = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5">
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
        <div className="mt-5">
          <Button fullWidth onClick={logout}>
            {t("common.logout")}
          </Button>
        </div>
      </div>
    </div>
  );
};
