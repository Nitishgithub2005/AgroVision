// App.tsx
import "react-native-gesture-handler"; // ensure gesture handler is initialized early
import React, { JSX } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { LogBox } from "react-native";

// hide some noisy warnings during development
LogBox.ignoreLogs([
  "Setting a timer",
  "Require cycle:",
  "Remote debugger",
]);

import AppNavigator from "./src/navigation/AppNavigator";

export default function App(): JSX.Element {
  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  );
}