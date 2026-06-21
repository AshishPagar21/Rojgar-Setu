import type { ReactNode } from "react";

import { AppNavbar } from "./AppNavbar";
import { BottomNav } from "./BottomNav";

export const AppLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-slate-50">
      <AppNavbar />

      {/* pb-24 leaves room above the bottom nav bar */}
      <div className="px-4 py-5 pb-24">
        <div className="mx-auto w-full max-w-md">{children}</div>
      </div>

      <BottomNav />
    </div>
  );
};
