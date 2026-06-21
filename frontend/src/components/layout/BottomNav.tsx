import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth";
import { routePaths } from "../../routes/routePaths";

/* ─── SVG icons (inline, no extra deps) ─────────────────────────── */
const HomeIcon = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
    <path
      d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"
      fill={active ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={active ? 0 : 1.8}
      strokeLinejoin="round"
    />
  </svg>
);

const SearchIcon = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
    <circle
      cx="11"
      cy="11"
      r="7"
      stroke="currentColor"
      strokeWidth="1.8"
      fill={active ? "currentColor" : "none"}
      fillOpacity={active ? 0.15 : 0}
    />
    <path
      d="M16.5 16.5 21 21"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    {active && (
      <circle cx="11" cy="11" r="3" fill="currentColor" fillOpacity={0.6} />
    )}
  </svg>
);

const ClipboardIcon = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
    <rect
      x="5"
      y="4"
      width="14"
      height="16"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.8"
      fill={active ? "currentColor" : "none"}
      fillOpacity={active ? 0.12 : 0}
    />
    <path
      d="M9 4a3 3 0 0 1 6 0"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path
      d="M9 12h6M9 16h4"
      stroke={active ? "currentColor" : "currentColor"}
      strokeWidth="1.8"
      strokeLinecap="round"
      opacity={active ? 1 : 0.5}
    />
  </svg>
);

const BriefcaseIcon = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
    <rect
      x="2"
      y="8"
      width="20"
      height="13"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.8"
      fill={active ? "currentColor" : "none"}
      fillOpacity={active ? 0.12 : 0}
    />
    <path
      d="M16 8V6a4 4 0 0 0-8 0v2"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path
      d="M2 13h20"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      opacity={active ? 1 : 0.5}
    />
  </svg>
);

const UsersIcon = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
    <circle
      cx="9"
      cy="7"
      r="4"
      stroke="currentColor"
      strokeWidth="1.8"
      fill={active ? "currentColor" : "none"}
      fillOpacity={active ? 0.15 : 0}
    />
    <path
      d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path
      d="M16 3.13a4 4 0 0 1 0 7.75M21 21v-2a4 4 0 0 0-3-3.87"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      opacity={active ? 1 : 0.6}
    />
  </svg>
);

const PlusCircleIcon = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
    <circle
      cx="12"
      cy="12"
      r="9"
      stroke="currentColor"
      strokeWidth="1.8"
      fill={active ? "currentColor" : "none"}
      fillOpacity={active ? 0.15 : 0}
    />
    <path
      d="M12 8v8M8 12h8"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const ShieldIcon = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
    <path
      d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C16.5 22.15 20 17.25 20 12V6L12 2z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
      fill={active ? "currentColor" : "none"}
      fillOpacity={active ? 0.15 : 0}
    />
    <path
      d="M9 12l2 2 4-4"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={active ? 1 : 0.5}
    />
  </svg>
);

/* ─── Nav item type ──────────────────────────────────────────────── */
interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: (active: boolean) => JSX.Element;
}

/* ─── Role-based tab config ──────────────────────────────────────── */
function useNavItems(): NavItem[] {
  const { user } = useAuth();
  const { t } = useTranslation();

  if (user?.role === "WORKER") {
    return [
      {
        id: "home",
        label: t("nav.home", "Home"),
        path: routePaths.dashboardWorker,
        icon: (a) => <HomeIcon active={a} />,
      },
      {
        id: "find-work",
        label: t("nav.findWork", "Find Work"),
        path: "/jobs/open",
        icon: (a) => <SearchIcon active={a} />,
      },
      {
        id: "applied",
        label: t("nav.applied", "Applied"),
        path: "/applications/my",
        icon: (a) => <ClipboardIcon active={a} />,
      },
    ];
  }

  if (user?.role === "EMPLOYER") {
    return [
      {
        id: "home",
        label: t("nav.home", "Home"),
        path: routePaths.dashboardEmployer,
        icon: (a) => <HomeIcon active={a} />,
      },
      {
        id: "post-job",
        label: t("nav.postJob", "Post Job"),
        path: "/jobs/create",
        icon: (a) => <PlusCircleIcon active={a} />,
      },
      {
        id: "my-jobs",
        label: t("nav.myJobs", "My Jobs"),
        path: "/jobs/my",
        icon: (a) => <BriefcaseIcon active={a} />,
      },
    ];
  }

  // ADMIN
  return [
    {
      id: "home",
      label: t("nav.home", "Home"),
      path: routePaths.dashboardAdmin,
      icon: (a) => <HomeIcon active={a} />,
    },
    {
      id: "users",
      label: t("nav.users", "Users"),
      path: "/admin/users",
      icon: (a) => <UsersIcon active={a} />,
    },
    {
      id: "admin",
      label: t("nav.admin", "Admin"),
      path: "/admin",
      icon: (a) => <ShieldIcon active={a} />,
    },
  ];
}

/* ─── Component ──────────────────────────────────────────────────── */
export const BottomNav = () => {
  const navItems = useNavItems();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <>
      {/* Spacer so page content doesn't hide behind the bar */}
      <div className="h-20" aria-hidden="true" />

      <nav
        className="fixed bottom-0 left-0 right-0 z-30 mx-auto"
        aria-label="Main navigation"
      >
        {/* Glass pill container */}
        <div className="mx-auto max-w-md px-3 pb-3">
          <div
            className="flex items-center justify-around rounded-3xl border border-white/60 bg-white/80 px-2 py-2 shadow-2xl"
            style={{
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              boxShadow:
                "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)",
            }}
          >
            {navItems.map((item) => {
              const isActive =
                item.path === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(item.path);

              return (
                <button
                  key={item.id}
                  type="button"
                  id={`bottom-nav-${item.id}`}
                  aria-label={item.label}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => navigate(item.path)}
                  className="relative flex flex-col items-center gap-1 rounded-2xl px-3 py-2 transition-all duration-200"
                  style={{
                    flex: 1,
                    color: isActive ? "var(--color-brand-600, #0070f3)" : "#64748b",
                    background: isActive
                      ? "linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(168,85,247,0.08) 100%)"
                      : "transparent",
                    transform: isActive ? "translateY(-2px)" : "none",
                  }}
                >
                  {/* Active glow dot */}
                  {isActive && (
                    <span
                      className="absolute -top-1 left-1/2 h-1 w-6 -translate-x-1/2 rounded-full"
                      style={{
                        background:
                          "linear-gradient(90deg, #6366f1, #a855f7)",
                      }}
                    />
                  )}

                  {/* Icon */}
                  <span
                    style={{
                      color: isActive ? "#6366f1" : "#94a3b8",
                      transition: "color 0.2s, transform 0.2s",
                      transform: isActive ? "scale(1.1)" : "scale(1)",
                      display: "block",
                    }}
                  >
                    {item.icon(isActive)}
                  </span>

                  {/* Label */}
                  <span
                    className="text-[10px] font-semibold leading-none tracking-wide"
                    style={{
                      color: isActive ? "#6366f1" : "#94a3b8",
                      transition: "color 0.2s",
                    }}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
};
