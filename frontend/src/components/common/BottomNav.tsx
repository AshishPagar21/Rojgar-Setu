import { Link } from "react-router-dom";

import { routePaths } from "../../routes/routePaths";

export const BottomNav = () => {
  return (
    <nav className="fixed inset-x-0 bottom-0 mx-auto w-full max-w-md border-t border-slate-200 bg-white px-4 py-3">
      <div className="flex items-center justify-between text-sm font-medium text-slate-600">
        <Link to={routePaths.root}>Home</Link>
        <Link to={routePaths.dashboardEmployer}>My Page</Link>
      </div>
    </nav>
  );
};
