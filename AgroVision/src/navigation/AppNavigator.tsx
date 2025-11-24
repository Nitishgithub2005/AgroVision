// src/navigation/AppNavigator.tsx
import React from "react";
import { Platform } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { DefaultTheme, Provider as PaperProvider } from "react-native-paper";

// Screens (we'll create these shortly)
import HomeScreen from "../screens/HomeScreen";
import ScanScreen from "../screens/ScanScreen";
import ChatScreen from "../screens/ChatScreen";
import HistoryScreen from "../screens/HistoryScreen";

export type RootTabParamList = {
  Home: undefined;
  Scan: undefined;
  Chat: undefined;
  History: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#2E7D32", // green
    accent: "#A1887F", // soil / brown accent
    background: "#F7FFF7",
    surface: "#FFFFFF",
    text: "#263238",
  },
};

export default function AppNavigator(): JSX.Element {
  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <Tab.Navigator
          initialRouteName="Home"
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarActiveTintColor: theme.colors.primary,
            tabBarInactiveTintColor: "#6E6E6E",
            tabBarStyle: {
              height: Platform.OS === "ios" ? 90 : 60,
              paddingBottom: Platform.OS === "ios" ? 20 : 8,
              backgroundColor: "#ffffffee",
              borderTopWidth: 0,
              elevation: 10,
            },
            tabBarIcon: ({ color, size }) => {
              let iconName = "home";

              if (route.name === "Home") {
                iconName = "home";
              } else if (route.name === "Scan") {
                iconName = "camera";
              } else if (route.name === "Chat") {
                iconName = "chat";
              } else if (route.name === "History") {
                iconName = "history";
              }

              return (
                <MaterialCommunityIcons
                  name={iconName}
                  color={color}
                  size={size ?? 24}
                />
              );
            },
          })}
        >
          <Tab.Screen name="Home" component={HomeScreen} options={{ title: "Home" }} />
          <Tab.Screen name="Scan" component={ScanScreen} options={{ title: "Scan Plant" }} />
          <Tab.Screen name="Chat" component={ChatScreen} options={{ title: "Chat" }} />
          <Tab.Screen name="History" component={HistoryScreen} options={{ title: "History" }} />
        </Tab.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}