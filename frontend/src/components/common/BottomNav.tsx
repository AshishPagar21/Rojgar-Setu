import { Link } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import { routePaths } from "../../routes/routePaths";

export const BottomNav = () => {
  const { user } = useAuth();

  const myPagePath =
    user?.role === "WORKER"
      ? routePaths.dashboardWorker
      : routePaths.dashboardEmployer;

  return (
    <nav className="fixed inset-x-0 bottom-0 mx-auto w-full max-w-md border-t border-slate-200 bg-white px-4 py-3">
      <div className="flex items-center justify-between text-sm font-medium text-slate-600">
        <Link to={routePaths.root}>Home</Link>
        <Link to={myPagePath}>My Page</Link>
      </div>
    </nav>
  );
};
