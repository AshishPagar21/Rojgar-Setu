import { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { Button } from "../../components/common/Button";
import { AppNavbar } from "../../components/layout/AppNavbar";
import { useAuth } from "../../hooks/useAuth";
import { employerService } from "../../modules/employer/employer.service";
import type { EmployerDashboardData } from "../../modules/employer/employer.types";
import { workerService } from "../../modules/worker/worker.service";
import type { WorkerDashboardData } from "../../modules/worker/worker.types";

const numberFormat = new Intl.NumberFormat();

const formatDate = (value?: string) => {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

const getStatusLabel = (
  status: string,
  t: (key: string, options?: any) => string,
) => {
  switch (status) {
    case "OPEN":
      return t("dashboard.statusOpen");
    case "ASSIGNED":
      return t("dashboard.statusAssigned");
    case "COMPLETED":
      return t("dashboard.statusCompleted");
    case "SELECTED":
      return t("dashboard.statusSelected");
    case "PENDING":
      return t("dashboard.statusPending");
    case "REJECTED":
      return t("dashboard.statusRejected");
    default:
      return status;
  }
};

const StatCard = ({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone: string;
}) => (
  <View style={styles.statCard}>
    <View style={[styles.statAccent, { backgroundColor: tone }]} />
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

const SectionCard = ({
  title,
  count,
  emptyText,
  children,
}: {
  title: string;
  count: number;
  emptyText: string;
  children: React.ReactNode;
}) => (
  <View style={styles.sectionCard}>
    <View style={styles.sectionHeader}>
      <View>
        <Text style={styles.sectionEyebrow}>{title}</Text>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.sectionCountPill}>
        <Text style={styles.sectionCountText}>{count}</Text>
      </View>
    </View>
    {count === 0 ? (
      <Text style={styles.emptyState}>{emptyText}</Text>
    ) : (
      <View style={styles.sectionList}>{children}</View>
    )}
  </View>
);

const ItemRow = ({
  title,
  subtitle,
  status,
}: {
  title: string;
  subtitle: string;
  status: string;
}) => (
  <View style={styles.itemRow}>
    <View style={styles.itemTextWrap}>
      <Text style={styles.itemTitle}>{title}</Text>
      <Text style={styles.itemSubtitle}>{subtitle}</Text>
    </View>
    <Text style={styles.itemStatus}>{status}</Text>
  </View>
);

export const DashboardScreen = () => {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const [dashboard, setDashboard] = useState<
    WorkerDashboardData | EmployerDashboardData | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const role = user?.role;

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);

        if (role === "EMPLOYER") {
          setDashboard(
            (await employerService.getDashboard()) as EmployerDashboardData,
          );
          return;
        }

        setDashboard(
          (await workerService.getDashboard()) as WorkerDashboardData,
        );
      } catch (err) {
        console.error(err);
        setError(t("dashboard.failedToLoadDashboard"));
      } finally {
        setLoading(false);
      }
    };

    void fetchDashboard();
  }, [role, t]);

  const welcomeName =
    profile?.employer?.name ||
    profile?.worker?.name ||
    user?.mobileNumber ||
    "";

  const heading = useMemo(() => {
    if (role === "EMPLOYER") return t("dashboard.employerTitle");
    if (role === "WORKER") return t("dashboard.workerTitle");
    return t("dashboard.adminTitle");
  }, [role, t]);

  const heroText =
    role === "EMPLOYER"
      ? t("dashboard.employerText")
      : role === "WORKER"
        ? t("dashboard.workerText")
        : t("dashboard.adminText");

  const heroStep =
    role === "EMPLOYER"
      ? t("dashboard.employerNextStep")
      : role === "WORKER"
        ? t("dashboard.workerNextStep")
        : t("dashboard.adminNextStep");

  const employerDashboard =
    role === "EMPLOYER" ? (dashboard as EmployerDashboardData | null) : null;
  const workerDashboard =
    role === "WORKER" ? (dashboard as WorkerDashboardData | null) : null;

  return (
    <View style={styles.page}>
      <AppNavbar />
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <Text style={styles.heroEyebrow}>{t("dashboard.atAGlance")}</Text>
          <Text style={styles.heroTitle}>
            {t("dashboard.welcome", { name: welcomeName })}
          </Text>
          <Text style={styles.heroText}>{heroText}</Text>
          <View style={styles.heroPill}>
            <Text style={styles.heroPillText}>{heroStep}</Text>
          </View>
        </View>

        {error ? <Text style={styles.errorCard}>{error}</Text> : null}
        {loading ? (
          <Text style={styles.loadingCard}>
            {t("dashboard.loadingDashboard")}
          </Text>
        ) : null}

        {role === "EMPLOYER" && employerDashboard ? (
          <>
            <View style={styles.statGrid}>
              <StatCard
                label={t("dashboard.totalJobsPosted")}
                value={numberFormat.format(employerDashboard.totalJobsPosted)}
                tone="#0ea5e9"
              />
              <StatCard
                label={t("dashboard.openJobs")}
                value={numberFormat.format(employerDashboard.openJobsCount)}
                tone="#10b981"
              />
              <StatCard
                label={t("dashboard.assignedJobs")}
                value={numberFormat.format(employerDashboard.assignedJobsCount)}
                tone="#f59e0b"
              />
              <StatCard
                label={t("dashboard.completedJobs")}
                value={numberFormat.format(employerDashboard.completedJobsCount)}
                tone="#38bdf8"
              />
            </View>

            <View style={styles.actionRow}>
              <Button fullWidth>{t("dashboard.postNewJob")}</Button>
              <Button fullWidth variant="secondary">
                {t("dashboard.viewAllJobs")}
              </Button>
            </View>

            <SectionCard
              title={t("dashboard.recentJobs")}
              count={employerDashboard.recentJobs.length}
              emptyText={t("dashboard.noJobs")}
            >
              {employerDashboard.recentJobs.map((job) => (
                <ItemRow
                  key={job.id}
                  title={job.title}
                  subtitle={job.category || t("dashboard.browseJobs")}
                  status={getStatusLabel(job.status, t)}
                />
              ))}
            </SectionCard>
          </>
        ) : null}

        {role === "WORKER" && workerDashboard ? (
          <>
            <View style={styles.statGrid}>
              <StatCard
                label={t("dashboard.totalApplications")}
                value={numberFormat.format(workerDashboard.totalApplications)}
                tone="#0ea5e9"
              />
              <StatCard
                label={t("dashboard.selectedJobs")}
                value={numberFormat.format(workerDashboard.selectedJobsCount)}
                tone="#10b981"
              />
              <StatCard
                label={t("dashboard.completedJobs")}
                value={numberFormat.format(workerDashboard.totalJobsCompleted)}
                tone="#38bdf8"
              />
              <StatCard
                label={t("dashboard.paymentsReceived")}
                value={numberFormat.format(workerDashboard.paymentReceivedCount)}
                tone="#f59e0b"
              />
            </View>

            <View style={styles.actionRow}>
              <Button fullWidth>{t("dashboard.findWork")}</Button>
              <Button fullWidth variant="secondary">
                {t("dashboard.myApplications")}
              </Button>
            </View>

            <SectionCard
              title={t("dashboard.recentApplications")}
              count={workerDashboard.recentApplications.length}
              emptyText={t("dashboard.noApplications")}
            >
              {workerDashboard.recentApplications.map((application) => (
                <ItemRow
                  key={application.id}
                  title={application.job.title}
                  subtitle={
                    application.job.category || t("dashboard.browseJobs")
                  }
                  status={getStatusLabel(application.status, t)}
                />
              ))}
            </SectionCard>

            <SectionCard
              title={t("dashboard.recentAssignedJobs")}
              count={workerDashboard.recentAssignedJobs.length}
              emptyText={t("dashboard.noAssignedJobs")}
            >
              {workerDashboard.recentAssignedJobs.map((job) => (
                <ItemRow
                  key={job.id}
                  title={job.job.title}
                  subtitle={
                    job.job.employer.name || t("dashboard.viewAssignedJobs")
                  }
                  status={getStatusLabel(job.status, t)}
                />
              ))}
            </SectionCard>
          </>
        ) : null}

        {!dashboard && !loading ? (
          <View style={styles.fallbackCard}>
            <Text style={styles.fallbackText}>{heading}</Text>
            <Text style={styles.fallbackTextSecondary}>
              {t("common.comingSoon")}
            </Text>
          </View>
        ) : null}

        {role === "ADMIN" ? (
          <View style={styles.fallbackCard}>
            <Text style={styles.fallbackText}>{heading}</Text>
            <Text style={styles.fallbackTextSecondary}>{heroText}</Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  container: {
    padding: 16,
    gap: 14,
    backgroundColor: "#f8fafc",
  },
  heroCard: {
    borderRadius: 28,
    padding: 18,
    backgroundColor: "#1e3a8a",
    gap: 8,
  },
  heroEyebrow: {
    color: "rgba(255,255,255,0.86)",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  heroTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
  },
  heroText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    lineHeight: 21,
  },
  heroPill: {
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginTop: 6,
  },
  heroPillText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  errorCard: {
    borderRadius: 18,
    padding: 14,
    backgroundColor: "#fef2f2",
    color: "#b91c1c",
    fontSize: 14,
  },
  loadingCard: {
    borderRadius: 18,
    padding: 14,
    backgroundColor: "#fff",
    color: "#475569",
    fontSize: 14,
  },
  statGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    width: "48%",
    borderRadius: 22,
    backgroundColor: "#fff",
    padding: 16,
    gap: 8,
  },
  statAccent: {
    height: 8,
    width: 52,
    borderRadius: 999,
  },
  statLabel: {
    color: "#64748b",
    fontSize: 12,
  },
  statValue: {
    color: "#0f172a",
    fontSize: 28,
    fontWeight: "800",
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
  },
  sectionCard: {
    borderRadius: 28,
    backgroundColor: "#fff",
    padding: 16,
    gap: 14,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  sectionEyebrow: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "700",
  },
  sectionTitle: {
    marginTop: 3,
    color: "#0f172a",
    fontSize: 17,
    fontWeight: "800",
  },
  sectionCountPill: {
    borderRadius: 999,
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  sectionCountText: {
    color: "#475569",
    fontSize: 12,
    fontWeight: "700",
  },
  emptyState: {
    borderRadius: 18,
    backgroundColor: "#f8fafc",
    color: "#64748b",
    padding: 14,
  },
  sectionList: {
    gap: 10,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 14,
    backgroundColor: "#fff",
  },
  itemTextWrap: {
    flex: 1,
    paddingRight: 10,
  },
  itemTitle: {
    color: "#0f172a",
    fontSize: 15,
    fontWeight: "800",
  },
  itemSubtitle: {
    color: "#64748b",
    fontSize: 12,
  },
  itemStatus: {
    color: "#1f4c9a",
    fontSize: 12,
    fontWeight: "800",
  },
  fallbackCard: {
    borderRadius: 22,
    backgroundColor: "#fff",
    padding: 18,
    gap: 6,
  },
  fallbackText: {
    color: "#0f172a",
    fontSize: 16,
    fontWeight: "800",
  },
  fallbackTextSecondary: {
    color: "#64748b",
    fontSize: 13,
  },
});
