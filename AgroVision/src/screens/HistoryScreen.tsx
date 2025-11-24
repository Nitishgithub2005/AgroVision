// src/screens/HistoryScreen.tsx
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Image,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Card, Text, ActivityIndicator } from "react-native-paper";
import axios from "axios";
import dayjs from "dayjs";

type HistoryItem = {
  id: string;
  image_url: string;
  label: string;
  confidence: number;
  suggestion?: string;
  timestamp: string;
};

export default function HistoryScreen() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      // TODO: replace demo user_id with real user identity
      const resp = await axios.get<{ items: HistoryItem[] }>(
        "http://YOUR_BACKEND_HOST:8000/api/v1/history?user_id=demo"
      );
      setItems(resp.data.items ?? []);
    } catch (err: any) {
      console.error("Failed to fetch history:", err);
      Alert.alert("Error", "Unable to fetch history. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchHistory();
    } finally {
      setRefreshing(false);
    }
  }, [fetchHistory]);

  const renderItem = ({ item }: { item: HistoryItem }) => {
    return (
      <TouchableOpacity
        onPress={() =>
          Alert.alert(
            `${item.label} — ${(item.confidence * 100).toFixed(1)}%`,
            item.suggestion ?? "No suggestion available"
          )
        }
      >
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <Image source={{ uri: item.image_url }} style={styles.thumb} />
            <View style={styles.meta}>
              <Text style={styles.label}>{item.label}</Text>
              <Text style={styles.confidence}>
                {(item.confidence * 100).toFixed(1)}% confidence
              </Text>
              <Text style={styles.timestamp}>
                {dayjs(item.timestamp).format("YYYY-MM-DD HH:mm")}
              </Text>
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator animating size="large" />
        <Text style={{ marginTop: 10 }}>Loading history...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(it) => it.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 12, paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Text>No history yet. Scan a plant to get started.</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E9F5E9" },
  card: {
    borderRadius: 12,
    marginVertical: 8,
    elevation: 2,
    paddingVertical: 8,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  thumb: {
    width: 90,
    height: 66,
    borderRadius: 8,
    resizeMode: "cover",
    backgroundColor: "#f0f0f0",
  },
  meta: {
    flex: 1,
    justifyContent: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1B4332",
  },
  confidence: {
    marginTop: 4,
    color: "#2E7D32",
    fontWeight: "600",
  },
  timestamp: {
    marginTop: 6,
    color: "#6E6E6E",
    fontSize: 12,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  empty: {
    marginTop: 60,
    alignItems: "center",
  },
});