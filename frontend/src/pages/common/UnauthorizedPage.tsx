import { Link } from "react-router-dom";

import { Button } from "../../components/common/Button";
import { routePaths } from "../../routes/routePaths";

export const UnauthorizedPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-panel bg-white p-6 text-center shadow-panel">
        <h1 className="text-xl font-bold text-slate-900">Access denied</h1>
        <p className="mt-2 text-sm text-slate-600">
          You do not have permission to open this page.
        </p>
        <Link to={routePaths.login}>
          <Button fullWidth className="mt-5">
            Go to login
          </Button>
        </Link>
      </div>
    </div>
  );
};
