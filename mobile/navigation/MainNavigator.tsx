import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { DashboardScreen } from "../screens/dashboard/DashboardScreen";
import { JobsScreen } from "../screens/dashboard/JobsScreen";
import { ApplicationsScreen } from "../screens/dashboard/ApplicationsScreen";
import { ProfileScreen } from "../screens/dashboard/ProfileScreen";

const Tab = createBottomTabNavigator();

export const MainNavigator = () => {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;

          if (route.name === "Dashboard") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Jobs") {
            iconName = focused ? "briefcase" : "briefcase-outline";
          } else if (route.name === "Applications") {
            iconName = focused
              ? "checkmark-circle"
              : "checkmark-circle-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#1559bf",
        tabBarInactiveTintColor: "#64748b",
        headerShown: false,
        tabBarStyle: {
          borderTopColor: "#e2e8f0",
          borderTopWidth: 1,
          backgroundColor: "#ffffff",
          height: 64,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginTop: -2,
          marginBottom: 6,
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: t("common.dashboard"),
        }}
      />
      <Tab.Screen
        name="Jobs"
        component={JobsScreen}
        options={{
          tabBarLabel: t("common.jobs"),
        }}
      />
      <Tab.Screen
        name="Applications"
        component={ApplicationsScreen}
        options={{
          tabBarLabel: t("common.applications"),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: t("common.profile"),
        }}
      />
    </Tab.Navigator>
  );
};
