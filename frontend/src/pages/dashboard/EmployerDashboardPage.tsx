import { useTranslation } from "react-i18next";

import { Button } from "../../components/common/Button";
import { PageHeader } from "../../components/common/PageHeader";
import { useAuth } from "../../hooks/useAuth";

export const EmployerDashboardPage = () => {
  const { t } = useTranslation();
  const { user, profile, logout } = useAuth();

  return (
    <div className="mx-auto w-full max-w-md rounded-panel bg-white p-5 shadow-panel">
      <PageHeader
        title={t("dashboard.employerTitle")}
        subtitle={t("dashboard.welcome", {
          name: profile?.employer?.name || user?.mobileNumber || "",
        })}
      />
      <p className="mb-5 text-sm text-slate-600">
        {t("dashboard.employerText")}
      </p>
      <Button fullWidth onClick={logout}>
        {t("common.logout")}
      </Button>
    </div>
  );
};
