import type { ReactNode } from "react";

import { APP_NAME } from "../../utils/constants";

export const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white px-4 py-6">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-brand-700">{APP_NAME}</h1>
          <p className="mt-2 text-sm text-slate-600">
            Find workers or find work easily
          </p>
        </div>
        <div className="rounded-panel bg-white p-5 shadow-panel">
          {children}
        </div>
      </div>
    </div>
  );
};
