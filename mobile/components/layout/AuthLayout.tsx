import type { ReactNode } from "react";
import { Image, StyleSheet, Text, View, Platform } from "react-native";
import { useTranslation } from "react-i18next";

import { LanguageSwitcher } from "../common/LanguageSwitcher";

export const AuthLayout = ({ children }: { children: ReactNode }) => {
  const { t } = useTranslation();

  // Skip image on web to avoid 404 errors
  const showLogo = Platform.OS !== "web";

  return (
    <View style={styles.container}>
      <View style={styles.bgOrbTop} />
      <View style={styles.bgOrbRight} />

      <View style={styles.cardHeader}>
        <View style={styles.headerRow}>
          <View style={styles.brandRow}>
            {showLogo && (
              <Image
                source={require("../../assets/images/icon.png")}
                style={styles.logo}
              />
            )}
            <View style={styles.brandTextWrap}>
              <Text style={styles.brandName}>{t("common.appName")}</Text>
              <Text style={styles.brandSubtitle}>{t("common.subtitle")}</Text>
            </View>
          </View>
          <LanguageSwitcher />
        </View>
      </View>

      <View style={styles.card}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#f3f7ff",
    position: "relative",
    overflow: "hidden",
  },
  bgOrbTop: {
    position: "absolute",
    top: -120,
    left: -60,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "#d9e9ff",
    opacity: 0.55,
  },
  bgOrbRight: {
    position: "absolute",
    top: -80,
    right: -120,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "#eef5ff",
    opacity: 0.8,
  },
  cardHeader: {
    marginBottom: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#dbeafe",
    backgroundColor: "#fff",
    shadowColor: "#0f172a",
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
    zIndex: 2,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flexShrink: 1,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  brandTextWrap: {
    flexShrink: 1,
  },
  brandName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#12499d",
  },
  brandSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: "#64748b",
  },
  card: {
    flex: 1,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#fff",
    padding: 20,
    shadowColor: "#0f172a",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
    zIndex: 2,
  },
});
