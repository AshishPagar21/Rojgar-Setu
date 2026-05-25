import { View, StyleSheet, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { AppNavbar } from "../../components/layout/AppNavbar";

export const ApplicationsScreen = () => {
  const { t } = useTranslation();

  return (
    <View style={styles.page}>
      <AppNavbar />
      <View style={styles.container}>
        <Text style={styles.title}>{t("common.applications")}</Text>
        <Text style={styles.subtitle}>{t("common.comingSoon")}</Text>
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
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#f8fafc",
  },
  title: {
    color: "#0f172a",
    fontSize: 24,
    fontWeight: "800",
  },
  subtitle: {
    marginTop: 8,
    color: "#64748b",
    fontSize: 14,
  },
});
