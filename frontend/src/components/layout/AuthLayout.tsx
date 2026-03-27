import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { LanguageSwitcher } from "../common/LanguageSwitcher";

export const AuthLayout = ({ children }: { children: ReactNode }) => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen px-4 py-4 sm:py-8">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-4 overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-panel">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="flex items-center gap-3">
              <img
                src="/logo.svg"
                alt="Rojgar Setu"
                className="h-10 w-10 rounded-lg"
              />
              <div>
                <p className="text-sm font-bold text-brand-700">
                  {t("common.appName")}
                </p>
                <p className="text-xs text-slate-500">{t("common.subtitle")}</p>
              </div>
            </div>
            <LanguageSwitcher />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-panel sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
};
