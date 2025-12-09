// src/screens/YieldEstimatorScreen.tsx

import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import axios from "axios";

type CropType = "Rice" | "Wheat" | "Cotton" | "Sugarcane" | "Maize" | "Other";
type Season = "Kharif" | "Rabi" | "Zaid";
type SoilType = "Clay" | "Sandy" | "Loamy" | "Black" | "Red";
type IrrigationType = "Drip" | "Sprinkler" | "Flood" | "Rainfed";

const CROP_OPTIONS: CropType[] = ["Rice", "Wheat", "Cotton", "Sugarcane", "Maize", "Other"];
const SEASON_OPTIONS: Season[] = ["Kharif", "Rabi", "Zaid"];
const SOIL_OPTIONS: SoilType[] = ["Clay", "Sandy", "Loamy", "Black", "Red"];
const IRRIGATION_OPTIONS: IrrigationType[] = ["Drip", "Sprinkler", "Flood", "Rainfed"];


// Replace with your Groq API key
const GROQ_API_KEY = "";

export default function YieldEstimatorScreen() {
  const [cropType, setCropType] = useState<CropType>("Rice");
  const [season, setSeason] = useState<Season>("Kharif");
  const [landArea, setLandArea] = useState("");
  const [soilType, setSoilType] = useState<SoilType>("Loamy");
  const [irrigationType, setIrrigationType] = useState<IrrigationType>("Drip");
  const [region, setRegion] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  const [showCropModal, setShowCropModal] = useState(false);
  const [showSeasonModal, setShowSeasonModal] = useState(false);
  const [showSoilModal, setShowSoilModal] = useState(false);
  const [showIrrigationModal, setShowIrrigationModal] = useState(false);
const scrollViewRef =useRef<ScrollView | null>(null);
const regionInputRef = useRef<TextInput | null>(null);
  const estimateYield = async () => {
    if (!landArea || !region) {
      Alert.alert("Missing Information", "Please fill all required fields");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const prompt = `You are an agricultural AI assistant. Based on the following farm parameters, provide a detailed yield estimation:

Crop Type: ${cropType}
Season: ${season}
Land Area: ${landArea} hectares
Soil Type: ${soilType}
Irrigation: ${irrigationType}
Region: ${region}

Please provide your response in the following JSON format ONLY (no additional text):
{
  "estimated_yield": "X tons per hectare",
  "total_production": "Y tons",
  "confidence_level": "High/Medium/Low",
  "factors_affecting": ["factor1", "factor2", "factor3"],
  "recommendations": ["recommendation1", "recommendation2", "recommendation3"],
  "market_value_estimate": "₹X - ₹Y per quintal",
  "best_practices": ["practice1", "practice2"],
  "risk_factors": ["risk1", "risk2"]
}

Consider Indian agricultural conditions, typical yields for this crop in this region, season suitability, soil compatibility, and irrigation efficiency.`;

      // Groq API request (OpenAI-compatible format)
      const res = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: "llama-3.3-70b-versatile", // You can also use: mixtral-8x7b-32768, llama-3.1-70b-versatile
          messages: [
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000,
        },
        {
          headers: {
            "Authorization": `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json",
          }
        }
      );

      const responseText = res.data?.choices?.[0]?.message?.content || "";
      
      // Try to parse JSON from response
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsedResult = JSON.parse(jsonMatch[0]);
          setResult(parsedResult);
        } else {
          // Fallback if no JSON found
          setResult({
            estimated_yield: "Unable to parse response",
            raw_response: responseText,
          });
        }
      } catch (parseError) {
        setResult({
          estimated_yield: "Unable to parse response",
          raw_response: responseText,
        });
      }
    } catch (error) {
      console.error("Estimation error:", error);
      Alert.alert("Error", "Failed to estimate yield. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const DropdownButton = ({ 
    label, 
    value, 
    onPress, 
    icon 
  }: { 
    label: string; 
    value: string; 
    onPress: () => void; 
    icon: string;
  }) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.dropdown} onPress={onPress}>
        <MaterialCommunityIcons name={icon} size={20} color="#2E7D32" />
        <Text style={styles.dropdownText}>{value}</Text>
        <MaterialCommunityIcons name="chevron-down" size={20} color="#666" />
      </TouchableOpacity>
    </View>
  );

  const ModalSelector = ({
    visible,
    onClose,
    options,
    selectedValue,
    onSelect,
    title,
  }: {
    visible: boolean;
    onClose: () => void;
    options: string[];
    selectedValue: string;
    onSelect: (value: any) => void;
    title: string;
  }) => (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          {options.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.modalOption,
                selectedValue === option && styles.selectedOption,
              ]}
              onPress={() => {
                onSelect(option);
                onClose();
              }}
            >
              <Text style={styles.modalOptionText}>{option}</Text>
              {selectedValue === option && (
                <MaterialCommunityIcons name="check-circle" size={24} color="#2E7D32" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <MaterialCommunityIcons name="calculator" size={28} color="#fff" />
        <Text style={styles.headerTitle}>Crop Yield Estimator</Text>
      </View>

  <ScrollView 
  ref={scrollViewRef}
  style={styles.scrollView} 
  showsVerticalScrollIndicator={false}
  keyboardShouldPersistTaps="handled"
>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Enter Farm Details</Text>

          <DropdownButton
            label="Crop Type *"
            value={cropType}
            onPress={() => setShowCropModal(true)}
            icon="sprout"
          />

          <DropdownButton
            label="Season *"
            value={season}
            onPress={() => setShowSeasonModal(true)}
            icon="weather-sunny"
          />

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Land Area (hectares) *</Text>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="ruler-square" size={20} color="#2E7D32" />
              <TextInput
                style={styles.input}
                placeholder="e.g., 5"
                value={landArea}
                onChangeText={setLandArea}
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <DropdownButton
            label="Soil Type *"
            value={soilType}
            onPress={() => setShowSoilModal(true)}
            icon="texture"
          />

          <DropdownButton
            label="Irrigation Type *"
            value={irrigationType}
            onPress={() => setShowIrrigationModal(true)}
            icon="water"
          />

<View style={styles.inputGroup}>
  <Text style={styles.label}>Region/State *</Text>
  <View style={styles.inputContainer}>
    <MaterialCommunityIcons name="map-marker" size={20} color="#2E7D32" />
    <TextInput
      ref={regionInputRef}
      style={styles.input}
      placeholder="e.g., Karnataka"
      value={region}
      onChangeText={setRegion}
      placeholderTextColor="#999"
      onFocus={() => {
        setTimeout(() => {
          regionInputRef.current?.measure((x, y, width, height, pageX, pageY) => {
            scrollViewRef.current?.scrollTo({ y: pageY - 100, animated: true });
          });
        }, 100);
      }}
    />
  </View>
</View>

          <TouchableOpacity
            style={[styles.estimateButton, loading && styles.estimateButtonDisabled]}
            onPress={estimateYield}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <MaterialCommunityIcons name="chart-line" size={20} color="#fff" />
                <Text style={styles.estimateButtonText}>Estimate Yield</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Results */}
        {result && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Yield Estimation Results</Text>

            {result.estimated_yield && (
              <View style={styles.resultItem}>
                <MaterialCommunityIcons name="chart-bar" size={24} color="#2E7D32" />
                <View style={styles.resultContent}>
                  <Text style={styles.resultLabel}>Estimated Yield</Text>
                  <Text style={styles.resultValue}>{result.estimated_yield}</Text>
                </View>
              </View>
            )}

            {result.total_production && (
              <View style={styles.resultItem}>
                <MaterialCommunityIcons name="package-variant" size={24} color="#FF9800" />
                <View style={styles.resultContent}>
                  <Text style={styles.resultLabel}>Total Production</Text>
                  <Text style={styles.resultValue}>{result.total_production}</Text>
                </View>
              </View>
            )}

            {result.confidence_level && (
              <View style={styles.resultItem}>
                <MaterialCommunityIcons name="shield-check" size={24} color="#2196F3" />
                <View style={styles.resultContent}>
                  <Text style={styles.resultLabel}>Confidence Level</Text>
                  <Text style={styles.resultValue}>{result.confidence_level}</Text>
                </View>
              </View>
            )}

            {result.market_value_estimate && (
              <View style={styles.resultItem}>
                <MaterialCommunityIcons name="currency-inr" size={24} color="#4CAF50" />
                <View style={styles.resultContent}>
                  <Text style={styles.resultLabel}>Market Value Estimate</Text>
                  <Text style={styles.resultValue}>{result.market_value_estimate}</Text>
                </View>
              </View>
            )}

            {result.recommendations && result.recommendations.length > 0 && (
              <View style={styles.listSection}>
                <Text style={styles.listTitle}>📋 Recommendations</Text>
                {result.recommendations.map((rec: string, idx: number) => (
                  <Text key={idx} style={styles.listItem}>• {rec}</Text>
                ))}
              </View>
            )}

            {result.best_practices && result.best_practices.length > 0 && (
              <View style={styles.listSection}>
                <Text style={styles.listTitle}>✅ Best Practices</Text>
                {result.best_practices.map((practice: string, idx: number) => (
                  <Text key={idx} style={styles.listItem}>• {practice}</Text>
                ))}
              </View>
            )}

            {result.factors_affecting && result.factors_affecting.length > 0 && (
              <View style={styles.listSection}>
                <Text style={styles.listTitle}>🌾 Factors Affecting Yield</Text>
                {result.factors_affecting.map((factor: string, idx: number) => (
                  <Text key={idx} style={styles.listItem}>• {factor}</Text>
                ))}
              </View>
            )}

            {result.risk_factors && result.risk_factors.length > 0 && (
              <View style={styles.listSection}>
                <Text style={styles.listTitle}>⚠️ Risk Factors</Text>
                {result.risk_factors.map((risk: string, idx: number) => (
                  <Text key={idx} style={styles.listItem}>• {risk}</Text>
                ))}
              </View>
            )}

            {result.raw_response && (
              <View style={styles.listSection}>
                <Text style={styles.listTitle}>Response</Text>
                <Text style={styles.listItem}>{result.raw_response}</Text>
              </View>
            )}
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Modals */}
      <ModalSelector
        visible={showCropModal}
        onClose={() => setShowCropModal(false)}
        options={CROP_OPTIONS}
        selectedValue={cropType}
        onSelect={setCropType}
        title="Select Crop Type"
      />

      <ModalSelector
        visible={showSeasonModal}
        onClose={() => setShowSeasonModal(false)}
        options={SEASON_OPTIONS}
        selectedValue={season}
        onSelect={setSeason}
        title="Select Season"
      />

      <ModalSelector
        visible={showSoilModal}
        onClose={() => setShowSoilModal(false)}
        options={SOIL_OPTIONS}
        selectedValue={soilType}
        onSelect={setSoilType}
        title="Select Soil Type"
      />

      <ModalSelector
        visible={showIrrigationModal}
        onClose={() => setShowIrrigationModal(false)}
        options={IRRIGATION_OPTIONS}
        selectedValue={irrigationType}
        onSelect={setIrrigationType}
        title="Select Irrigation Type"
      />
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
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingLeft: 8,
    fontSize: 15,
    color: "#333",
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  dropdownText: {
    flex: 1,
    fontSize: 15,
    color: "#333",
    marginLeft: 8,
  },
  estimateButton: {
    backgroundColor: "#2E7D32",
    borderRadius: 8,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
  },
  estimateButtonDisabled: {
    opacity: 0.6,
  },
  estimateButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  resultContent: {
    flex: 1,
    marginLeft: 12,
  },
  resultLabel: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
  },
  resultValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  listSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  listTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  listItem: {
    fontSize: 14,
    color: "#666",
    marginBottom: 6,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  modalOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  selectedOption: {
    backgroundColor: "#f0f8f0",
  },
  modalOptionText: {
    fontSize: 16,
    color: "#333",
  },
});