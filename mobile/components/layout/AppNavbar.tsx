import { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "../../hooks/useAuth";
import { LanguageSwitcher } from "../common/LanguageSwitcher";

const roleLabel: Record<string, string> = {
  ADMIN: "Admin",
  EMPLOYER: "Employer",
  WORKER: "Worker",
};

export const AppNavbar = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { user, profile, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const displayName = useMemo(() => {
    if (profile?.employer?.name) return profile.employer.name;
    if (profile?.worker?.name) return profile.worker.name;
    return user?.mobileNumber ?? t("common.user");
  }, [profile, user, t]);

  const userRoleLabel = user?.role ? roleLabel[user.role] : t("common.user");

  const quickActions = useMemo(() => {
    if (user?.role === "EMPLOYER") {
      return [
        { label: t("common.postJob"), onClick: () => navigation.navigate("Jobs") },
        { label: t("common.myJobs"), onClick: () => navigation.navigate("Jobs") },
      ];
    }

    if (user?.role === "WORKER") {
      return [
        { label: t("common.findWork"), onClick: () => navigation.navigate("Jobs") },
        {
          label: t("common.myApplications"),
          onClick: () => navigation.navigate("Applications"),
        },
      ];
    }

    return [
      { label: t("common.dashboard"), onClick: () => navigation.navigate("Dashboard") },
    ];
  }, [navigation, t, user?.role]);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
  };

  return (
    <>
      <View style={[styles.wrapper, { paddingTop: Math.max(insets.top, 10) }]}> 
        <View style={styles.container}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate("Dashboard")}
            style={styles.brandButton}
          >
            <View style={styles.brandIcon}>
              <Text style={styles.brandIconText}>R</Text>
            </View>
            <View>
              <Text style={styles.brandName}>{t("common.appName")}</Text>
              <Text style={styles.brandSubtitle}>{t("common.subtitle")}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setMenuOpen(true)}
            accessibilityLabel={t("common.accountMenu")}
            style={styles.avatarButton}
          >
            <Text style={styles.avatarIcon}>U</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        animationType="fade"
        transparent
        visible={menuOpen}
        onRequestClose={() => setMenuOpen(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setMenuOpen(false)}>
          <Pressable
            style={[styles.menuCard, { marginTop: Math.max(insets.top, 16) + 56 }]}
            onPress={() => undefined}
          >
            <View style={styles.menuTopSection}>
              <Text numberOfLines={1} style={styles.menuName}>
                {displayName}
              </Text>
              <Text style={styles.menuRole}>{userRoleLabel}</Text>
            </View>

            <View style={styles.menuBody}>
              <TouchableOpacity
                style={styles.menuButton}
                activeOpacity={0.8}
                onPress={() => {
                  setMenuOpen(false);
                  navigation.navigate("Profile");
                }}
              >
                <Text style={styles.menuButtonLabel}>{t("common.profile")}</Text>
                <Text style={styles.menuButtonMeta}>{t("common.account")}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuButton}
                activeOpacity={0.8}
                onPress={() => {
                  setMenuOpen(false);
                  navigation.navigate("Dashboard");
                }}
              >
                <Text style={styles.menuButtonLabel}>{t("common.dashboard")}</Text>
                <Text style={styles.menuButtonMeta}>{t("common.goTo")}</Text>
              </TouchableOpacity>

              <View style={styles.blockCard}>
                <Text style={styles.blockTitle}>{t("common.settings")}</Text>
                <View style={{ marginTop: 10 }}>
                  <LanguageSwitcher />
                </View>
              </View>

              <View style={[styles.blockCard, styles.quickActionCard]}>
                <Text style={styles.blockTitle}>{t("common.quickActions")}</Text>
                <View style={{ marginTop: 8, gap: 4 }}>
                  {quickActions.map((action) => (
                    <TouchableOpacity
                      key={action.label}
                      style={styles.quickActionButton}
                      activeOpacity={0.8}
                      onPress={() => {
                        setMenuOpen(false);
                        action.onClick();
                      }}
                    >
                      <Text style={styles.quickActionText}>{action.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                style={[styles.menuButton, styles.logoutButton]}
                activeOpacity={0.8}
                onPress={handleLogout}
              >
                <Text style={styles.logoutText}>{t("common.logout")}</Text>
                <Text style={styles.logoutMeta}>{t("common.signOut")}</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brandButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flexShrink: 1,
  },
  brandIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1559bf",
  },
  brandIconText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "900",
  },
  brandName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
  },
  brandSubtitle: {
    fontSize: 12,
    color: "#64748b",
  },
  avatarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarIcon: {
    fontSize: 16,
    fontWeight: "700",
    color: "#334155",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.22)",
    alignItems: "flex-end",
    paddingHorizontal: 16,
  },
  menuCard: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  menuTopSection: {
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
  },
  menuRole: {
    marginTop: 3,
    fontSize: 12,
    color: "#64748b",
  },
  menuBody: {
    padding: 8,
    gap: 6,
  },
  menuButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  menuButtonLabel: {
    color: "#334155",
    fontSize: 14,
  },
  menuButtonMeta: {
    color: "#94a3b8",
    fontSize: 12,
  },
  blockCard: {
    borderRadius: 14,
    backgroundColor: "#f8fafc",
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  quickActionCard: {
    backgroundColor: "#eef5ff",
  },
  blockTitle: {
    textTransform: "uppercase",
    letterSpacing: 0.6,
    fontSize: 11,
    fontWeight: "700",
    color: "#64748b",
  },
  quickActionButton: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#fff",
  },
  quickActionText: {
    color: "#12499d",
    fontSize: 13,
    fontWeight: "600",
  },
  logoutButton: {
    marginTop: 2,
  },
  logoutText: {
    color: "#dc2626",
    fontSize: 14,
    fontWeight: "600",
  },
  logoutMeta: {
    color: "#f87171",
    fontSize: 12,
  },
});