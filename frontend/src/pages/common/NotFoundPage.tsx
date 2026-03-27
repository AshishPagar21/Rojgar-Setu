import { Link } from "react-router-dom";

import { Button } from "../../components/common/Button";
import { routePaths } from "../../routes/routePaths";

export const NotFoundPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-panel bg-white p-6 text-center shadow-panel">
        <h1 className="text-xl font-bold text-slate-900">Page not found</h1>
        <p className="mt-2 text-sm text-slate-600">This page does not exist.</p>
        <Link to={routePaths.root}>
          <Button fullWidth className="mt-5">
            Go home
          </Button>
        </Link>
      </div>
    </div>
  );
};
