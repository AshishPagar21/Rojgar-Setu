import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { Platform, View, Text } from "react-native";
import "react-native-reanimated";

console.log("===== APP STARTING (index.tsx) =====");

// Web setup
let rootElement: HTMLElement | null = null;

if (Platform.OS === "web") {
  console.log("Setting up web root element...");
  rootElement = document.getElementById("root");

  if (!rootElement) {
    rootElement = document.createElement("div");
    rootElement.id = "root";
    rootElement.style.width = "100%";
    rootElement.style.height = "100vh";
    rootElement.style.margin = "0";
    rootElement.style.padding = "0";
    rootElement.style.backgroundColor = "#fff";
    rootElement.style.fontFamily = "sans-serif";
    document.body.appendChild(rootElement);
    console.log("✓ Created #root element");
  }

  // Fallback: Show loading message in case React fails
  if (rootElement && rootElement.children.length === 0) {
    rootElement.innerHTML =
      '<div style="padding:20px; color:#999; text-align:center;">Loading Rojagar-Setu...</div>';
    console.log("✓ Injected loading message");
  }
}

console.log("Importing i18n...");
import "./i18n";
console.log("✓ i18n imported");

console.log("Importing AuthContext...");
import { AuthProvider } from "./context/AuthContext";
console.log("✓ AuthContext imported");

console.log("Importing RootNavigator...");
import { RootNavigator } from "./navigation/RootNavigator";
console.log("✓ RootNavigator imported");

console.log("Defining App component...");

const App: React.FC = () => {
  console.log(">>> APP COMPONENT RENDERING <<<");

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
        <StatusBar style="auto" />
      </AuthProvider>
    </SafeAreaProvider>
  );
};

console.log("App component defined, exporting...");

export default App;

// Web: Explicitly render the app using React 18
if (Platform.OS === "web") {
  console.log("Web platform detected, mounting React app...");

  // Dynamically import React 18 DOM for web
  import("react-dom/client")
    .then(({ createRoot }) => {
      console.log("React DOM client imported, creating root...");
      const root = rootElement || document.getElementById("root");

      if (root) {
        console.log("Root element found, rendering App component...");
        try {
          const reactRoot = createRoot(root);
          reactRoot.render(
            <React.StrictMode>
              <App />
            </React.StrictMode>,
          );
          console.log("✓ App rendered successfully");
        } catch (error) {
          console.error("Error rendering app:", error);
        }
      } else {
        console.error("❌ Root element not found!");
      }
    })
    .catch((error) => {
      console.error("Error importing ReactDOM:", error);
    });
}

console.log("===== MODULE LOADED SUCCESSFULLY ====");
