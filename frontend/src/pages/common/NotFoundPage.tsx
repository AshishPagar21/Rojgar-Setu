import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Button } from "../../components/common/Button";
import { routePaths } from "../../routes/routePaths";

export const NotFoundPage = () => {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-panel bg-white p-6 text-center shadow-panel">
        <h1 className="text-xl font-bold text-slate-900">
          {t("pages.notFoundTitle")}
        </h1>
        <p className="mt-2 text-sm text-slate-600">{t("pages.notFoundText")}</p>
        <Link to={routePaths.root}>
          <Button fullWidth className="mt-5">
            {t("pages.goHome")}
          </Button>
        </Link>
      </div>
    </div>
  );
};
