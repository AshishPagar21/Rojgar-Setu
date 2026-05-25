import { View, StyleSheet, Text } from "react-native";
import { useTranslation } from "react-i18next";

import { LanguageSwitcher } from "../../components/common/LanguageSwitcher";
import { AppNavbar } from "../../components/layout/AppNavbar";
import { useAuth } from "../../hooks/useAuth";

export const ProfileScreen = () => {
  const { t } = useTranslation();
  const { user, profile } = useAuth();

  const name =
    profile?.employer?.name ||
    profile?.worker?.name ||
    t("common.notAvailable");

  return (
    <View style={styles.page}>
      <AppNavbar />
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>{t("common.profile")}</Text>
          <Text style={styles.subtitle}>{t("common.accountDetails")}</Text>

          <View style={styles.row}>
            <Text style={styles.label}>{t("common.name")}</Text>
            <Text style={styles.value}>{name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{t("common.mobileNumber")}</Text>
            <Text style={styles.value}>
              {user?.mobileNumber || t("common.notAvailable")}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{t("common.role")}</Text>
            <Text style={styles.value}>
              {user?.role || t("common.notAvailable")}
            </Text>
          </View>

          <LanguageSwitcher />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f8fafc",
  },
  card: {
    borderRadius: 28,
    backgroundColor: "#fff",
    padding: 18,
    gap: 14,
  },
  title: {
    color: "#0f172a",
    fontSize: 24,
    fontWeight: "800",
  },
  subtitle: {
    color: "#64748b",
    fontSize: 14,
  },
  row: {
    gap: 4,
  },
  label: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  value: {
    color: "#0f172a",
    fontSize: 15,
    fontWeight: "700",
  },
});
