import type { ReactNode } from "react";

import { LanguageSwitcher } from "../common/LanguageSwitcher";

export const AppLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-5">
      <div className="mx-auto mb-4 w-full max-w-md">
        <LanguageSwitcher />
      </div>
      {children}
    </div>
  );
};
