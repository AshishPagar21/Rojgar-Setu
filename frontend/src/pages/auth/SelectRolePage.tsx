import { useTranslation } from "react-i18next";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

import { RoleSelector } from "../../components/auth/RoleSelector";
import { PageHeader } from "../../components/common/PageHeader";
import { AuthLayout } from "../../components/layout/AuthLayout";
import { routePaths } from "../../routes/routePaths";

interface SelectRoleState {
  mobileNumber: string;
  otp: string;
}

export const SelectRolePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as SelectRoleState | undefined;

  if (!state?.mobileNumber || !state?.otp) {
    return <Navigate to={routePaths.login} replace />;
  }

  const handleSelect = (role: "EMPLOYER" | "WORKER") => {
    if (role === "EMPLOYER") {
      navigate(routePaths.registerEmployer, { state });
      return;
    }

    navigate(routePaths.registerWorker, { state });
  };

  return (
    <AuthLayout>
      <PageHeader
        title={t("auth.selectRoleTitle")}
        subtitle={t("auth.selectRoleSubtitle")}
      />
      <RoleSelector onSelect={handleSelect} />
    </AuthLayout>
  );
};
