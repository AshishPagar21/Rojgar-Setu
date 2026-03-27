import { Button } from "../../components/common/Button";
import { PageHeader } from "../../components/common/PageHeader";
import { useAuth } from "../../hooks/useAuth";

export const EmployerDashboardPage = () => {
  const { user, profile, logout } = useAuth();

  return (
    <div className="mx-auto w-full max-w-md rounded-panel bg-white p-5 shadow-panel">
      <PageHeader
        title="Employer Dashboard"
        subtitle={`Welcome ${profile?.employer?.name || user?.mobileNumber || ""}`}
      />
      <p className="mb-5 text-sm text-slate-600">
        You can start posting jobs soon.
      </p>
      <Button fullWidth onClick={logout}>
        Logout
      </Button>
    </div>
  );
};
