import type { ReactNode } from "react";

import { AppNavbar } from "./AppNavbar";

export const AppLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-slate-50">
      <AppNavbar />

      <div className="px-4 py-5">
        <div className="mx-auto w-full max-w-md">{children}</div>
      </div>
    </div>
  );
};
