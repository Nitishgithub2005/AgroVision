// src/screens/HomeScreen.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { Card, Text } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>AgriScan AI</Text>

      <View style={styles.cardContainer}>
        <Card style={styles.card} onPress={() => navigation.navigate("Scan")}>
          <Card.Content style={styles.cardContent}>
            <MaterialCommunityIcons name="camera" size={45} color="#2E7D32" />
            <Text style={styles.cardText}>Scan Plant</Text>
          </Card.Content>
        </Card>

        <Card style={styles.card} onPress={() => navigation.navigate("Chat")}>
          <Card.Content style={styles.cardContent}>
            <MaterialCommunityIcons name="chat" size={45} color="#2E7D32" />
            <Text style={styles.cardText}>Agri Chatbot</Text>
          </Card.Content>
        </Card>

        <Card style={styles.card} onPress={() => navigation.navigate("History")}>
          <Card.Content style={styles.cardContent}>
            <MaterialCommunityIcons name="history" size={45} color="#2E7D32" />
            <Text style={styles.cardText}>History</Text>
          </Card.Content>
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E9F5E9",
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#2E7D32",
    marginBottom: 20,
    textAlign: "center",
  },
  cardContainer: {
    marginTop: 10,
    gap: 20,
  },
  card: {
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    elevation: 3,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 20,
  },
  cardText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1B4332",
  },
});