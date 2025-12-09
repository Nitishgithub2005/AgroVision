// src/navigation/AppNavigator.tsx
import React, { JSX } from "react";
import { Platform } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { DefaultTheme, Provider as PaperProvider } from "react-native-paper";

// Screens
import HomeScreen from "../screens/HomeScreen";
import ScanScreen from "../screens/ScanScreen";
import ChatScreen from "../screens/ChatScreen";
import YieldEstimatorScreen from "../screens/YieldEstimatorScreen";

export type RootTabParamList = {
  HomeTab: undefined;
  Scan: undefined;
  Chat: undefined;
  Estimate_Yield: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  YieldEstimator: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();

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

// Create Home Stack Navigator
function HomeStackNavigator() {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen name="YieldEstimator" component={YieldEstimatorScreen} />
    </HomeStack.Navigator>
  );
}

export default function AppNavigator(): JSX.Element {
  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <Tab.Navigator
          initialRouteName="HomeTab"
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

              if (route.name === "HomeTab") {
                iconName = "home";
              } else if (route.name === "Scan") {
                iconName = "camera";
              } else if (route.name === "Chat") {
                iconName = "chat";
              } else if (route.name === "Estimate_Yield") {
                iconName = "calculator";
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
          <Tab.Screen 
            name="HomeTab" 
            component={HomeStackNavigator} 
            options={{ title: "Home" }} 
          />
          <Tab.Screen 
            name="Scan" 
            component={ScanScreen} 
            options={{ title: "Scan Plant" }} 
          />
          <Tab.Screen 
            name="Chat" 
            component={ChatScreen} 
            options={{ title: "Chat" }} 
          />
          <Tab.Screen 
            name="Estimate_Yield" 
            component={YieldEstimatorScreen} 
            options={{ title: "Estimate Yield" }} 
          />
        </Tab.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}