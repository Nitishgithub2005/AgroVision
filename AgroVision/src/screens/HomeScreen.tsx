// src/screens/HomeScreen.tsx
import React, { useState } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";

export default function HomeScreen() {
  const navigation = useNavigation<any>();

  // Stats data - Updated with 2024-25 Economic Survey & Ministry of Agriculture data
  const stats = [
    { label: "Total Agricultural Land", value: "178M ha", change: "↑ 1.2%", icon: "sprout", color: "#4CAF50" }, // Approx 178.5M ha total agri land
    { label: "Total Production", value: "332M tons", change: "↑ 6.5%", icon: "package-variant", color: "#FF9800" }, // Record 332.3M tonnes (2023-24)
    { label: "Average Yield", value: "2.53 tons/ha", change: "↑ 2.1%", icon: "scale-balance", color: "#2196F3" }, // ~2525 kg/ha
    { label: "Irrigated Land", value: "55%", change: "↑ 2.8%", icon: "water", color: "#F44336" }, // Economic Survey 2024-25
  ];

  // Seasons data - Refined crop lists
  const seasons = [
    {
      name: "Kharif (June-October)",
      crops: "Rice, Maize, Cotton, Soybean, Tur",
      icon: "leaf",
      color: "#4CAF50",
      current: false, // Assuming current date is within Kharif or post-harvest
    },
    {
      name: "Rabi (October-March)",
      crops: "Wheat, Barley, Gram, Mustard",
      icon: "flower",
      color: "#FF9800",
      current: true,
    },
    {
      name: "Zaid (March-June)",
      crops: "Watermelon, Vegetables, Fodder",
      icon: "seed",
      color: "#2196F3",
      current: false,
    },
  ];

  // Top states data - Updated based on Gross Value of Output (GVO) in ₹ Lakh Crore
  const topStates = [
    { rank: 1, name: "Uttar Pradesh", value: "₹ 5.1 Lakh Cr", percentage: 100 }, // consistently #1 in total output value
    { rank: 2, name: "Madhya Pradesh", value: "₹ 4.2 Lakh Cr", percentage: 82 }, // major surge in pulses/oilseeds
    { rank: 3, name: "Maharashtra", value: "₹ 3.8 Lakh Cr", percentage: 74 }, // high value cash crops (sugar/cotton)
    { rank: 4, name: "Punjab", value: "₹ 3.1 Lakh Cr", percentage: 61 }, // high grain productivity
  ];

  const handleViewAllStates = () => {
    // Navigate to your list screen, or show an alert if not implemented yet
    // navigation.navigate("StateRankings"); 
    Alert.alert("Navigation", "Navigate to full State Rankings screen here.");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Agricultural Dashboard</Text>
        <Text style={styles.headerSubtitle}>AI-powered analytics for Indian agriculture</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: `${stat.color}20` }]}>
                <MaterialCommunityIcons name={stat.icon} size={24} color={stat.color} />
              </View>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statChange}>{stat.change} vs last year</Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate("YieldEstimator")}
            >
              <MaterialCommunityIcons name="calculator" size={32} color="#2E7D32" />
              <Text style={styles.actionText}>Estimate Yield</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate("Scan")}
            >
              <MaterialCommunityIcons name="camera" size={32} color="#2E7D32" />
              <Text style={styles.actionText}>Scan Plant</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate("Chat")}
            >
              <MaterialCommunityIcons name="chat" size={32} color="#2E7D32" />
              <Text style={styles.actionText}>Chat Bot</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Agricultural Seasons */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Agricultural Seasons</Text>
            <Text style={styles.currentLabel}>Current: Rabi</Text>
          </View>

          <View style={styles.card}>
            {seasons.map((season, index) => (
              <View key={index} style={styles.seasonItem}>
                <View style={[styles.seasonIcon, { backgroundColor: `${season.color}20` }]}>
                  <MaterialCommunityIcons name={season.icon} size={24} color={season.color} />
                </View>
                <View style={styles.seasonInfo}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Text style={styles.seasonName}>{season.name}</Text>
                    {season.current && (
                      <View style={styles.currentBadge}>
                        <Text style={styles.currentBadgeText}>Current</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.seasonCrops}>{season.crops}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Top Agricultural States */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Agricultural States</Text>
            {/* FIXED: Added onPress handler */}
            <TouchableOpacity onPress={handleViewAllStates}>
              <Text style={styles.viewAll}>View All →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            {topStates.map((state, index) => (
              <View key={index} style={styles.stateItem}>
                <View style={styles.stateRank}>
                  <Text style={styles.stateRankText}>{state.rank}</Text>
                </View>
                <View style={styles.stateContent}>
                  <View style={styles.stateHeader}>
                    <Text style={styles.stateName}>{state.name}</Text>
                    <Text style={styles.stateValue}>{state.value}</Text>
                  </View>
                  <View style={styles.stateBar}>
                    <View style={[styles.stateBarFill, { width: `${state.percentage}%` }]} />
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F8F0",
  },
  header: {
    backgroundColor: "#2E7D32",
    padding: 16,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#fff",
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 16,
  },
  statCard: {
    width: "48%",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 11,
    color: "#666",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2E7D32",
    marginBottom: 2,
  },
  statChange: {
    fontSize: 11,
    color: "#4CAF50",
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  currentLabel: {
    fontSize: 12,
    color: "#2E7D32",
    fontWeight: "600",
  },
  viewAll: {
    fontSize: 12,
    color: "#2E7D32",
    fontWeight: "600",
  },
  quickActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionText: {
    fontSize: 12,
    color: "#333",
    fontWeight: "600",
    marginTop: 8,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  seasonItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  seasonIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  seasonInfo: {
    flex: 1,
  },
  seasonName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  seasonCrops: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  currentBadge: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  currentBadgeText: {
    fontSize: 10,
    color: "#fff",
    fontWeight: "600",
  },
  stateItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  stateRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  stateRankText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2E7D32",
  },
  stateContent: {
    flex: 1,
  },
  stateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  stateName: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  stateValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2E7D32",
  },
  stateBar: {
    height: 6,
    backgroundColor: "#E8F5E9",
    borderRadius: 3,
  },
  stateBarFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 3,
  },
});