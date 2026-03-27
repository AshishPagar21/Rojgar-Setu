import type { ReactNode } from "react";

export const AppLayout = ({ children }: { children: ReactNode }) => {
  return <div className="min-h-screen bg-slate-50 px-4 py-5">{children}</div>;
};
