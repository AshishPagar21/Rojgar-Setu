import React from "react";
import { ActivityIndicator, View, Platform, Text } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../hooks/useAuth";
import { MainNavigator } from "./MainNavigator";
import { LoginScreen } from "../screens/auth/LoginScreen";
import { VerifyOtpScreen } from "../screens/auth/VerifyOtpScreen";
import { SelectRoleScreen } from "../screens/auth/SelectRoleScreen";
import { EmployerRegisterScreen } from "../screens/auth/EmployerRegisterScreen";
import { WorkerRegisterScreen } from "../screens/auth/WorkerRegisterScreen";

const Stack = createNativeStackNavigator();

export const RootNavigator = () => {
  console.log("RootNavigator rendering...");
  const { isAuthenticated, isLoading } = useAuth();
  console.log("Auth state:", { isAuthenticated, isLoading });

  if (isLoading) {
    console.log("Showing loading screen...");

    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f0f0f0",
        }}
      >
        <View
          style={{
            padding: 40,
            backgroundColor: "#fff",
            borderRadius: 8,
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 18, color: "#333", marginBottom: 20 }}>
            Loading authentication...
          </Text>
          <ActivityIndicator size="large" color="#1f4c9a" />
        </View>
      </View>
    );
  }

  console.log("Rendering stack navigator...");
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {isAuthenticated ? (
        <Stack.Screen name="Main" component={MainNavigator} />
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="VerifyOtp" component={VerifyOtpScreen} />
          <Stack.Screen name="SelectRole" component={SelectRoleScreen} />
          <Stack.Screen
            name="EmployerRegister"
            component={EmployerRegisterScreen}
          />
          <Stack.Screen
            name="WorkerRegister"
            component={WorkerRegisterScreen}
          />
        </>
      )}
    </Stack.Navigator>
  );
};
