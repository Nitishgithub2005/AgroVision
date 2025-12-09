// import React, { useState, useRef, useEffect } from "react";
// import {
//   View,
//   StyleSheet,
//   Image,
//   ActivityIndicator,
//   Alert,
//   Platform,
//   ScrollView,
//   Text,
//   TouchableOpacity,
//   Modal,
//   Keyboard,
// } from "react-native";
// import { Button, Card } from "react-native-paper";
// import { launchCamera, launchImageLibrary } from "react-native-image-picker";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import Icon from "react-native-vector-icons/MaterialCommunityIcons";

// type PredictionResponse = {
//   predicted_class: string;
//   confidence: number;
//   top_3_predictions: Array<{
//     class: string;
//     confidence: number;
//   }>;
// };

// // --- CONFIG (FRONTEND-ONLY, DANGEROUS IN PRODUCTION) ---
// const GEMINI_API_KEY = ""; // <<-- PUT DEV KEY HERE ONLY
// const GEMINI_MODEL = "gemini-2.0-flash";
// const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

// // --- Languages ---
// type LanguageCode = "en" | "kn" | "hi" | "te" | "ta";
// interface Language {
//   name: string;
//   greeting: string;
// }
// const LANGUAGES: Record<LanguageCode, Language> = {
//   en: { name: "English", greeting: "Hello Farmer Friend! How can I help you today?" },
//   kn: { name: "ಕನ್ನಡ", greeting: "ನಮಸ್ಕಾರ ರೈತ ಮಿತ್ರ! ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?" },
//   hi: { name: "हिंदी", greeting: "नमस्ते किसान मित्र! मैं आपकी कैसे मदद कर सकता हूं?" },
//   te: { name: "తెలుగు", greeting: "నమస్కారం రైతు మిత్రమా! నేను మీకు ఎలా సహాయం చేయగలను?" },
//   ta: { name: "தமிழ்", greeting: "வணக்கம் விவசாயி நண்பரே! நான் உங்களுக்கு எப்படி உதவ முடியும்?" },
// };

// // --- Simple cache helpers using AsyncStorage ---
// async function getValidCache(key: string) {
//   try {
//     const raw = await AsyncStorage.getItem(key);
//     if (!raw) return null;
//     const parsed = JSON.parse(raw);
//     if (parsed.expires && Date.now() > parsed.expires) {
//       await AsyncStorage.removeItem(key);
//       return null;
//     }
//     return parsed.value;
//   } catch {
//     return null;
//   }
// }
// async function setCache(key: string, value: any, ttlSeconds = 60 * 60 * 24 * 7) {
//   const wrapped = { value, expires: Date.now() + ttlSeconds * 1000 };
//   try {
//     await AsyncStorage.setItem(key, JSON.stringify(wrapped));
//   } catch {}
// }

// // --- Gemini call helpers (frontend) ---
// async function callGemini(body: any) {
//   const resp = await fetch(GEMINI_ENDPOINT, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(body),
//   });

//   const text = await resp.text();
//   let json;
//   try {
//     json = text ? JSON.parse(text) : null;
//   } catch (parseErr) {
//     // Not JSON - show raw text in error for debugging
//     if (!resp.ok) {
//       throw new Error(`Gemini ${resp.status}: ${text}`);
//     }
//     // If it's not an error but not JSON, return raw
//     return { raw_text: text };
//   }

//   if (!resp.ok) {
//     // Surface the full structured error (very helpful)
//     throw new Error(`Gemini ${resp.status}: ${JSON.stringify(json)}`);
//   }

//   return json;
// }

// /**
//  * Parse the most useful content from a Gemini candidate response.
//  * Returns an object if JSON found, otherwise returns { raw: text }
//  */
// async function parseCandidateJson(data: any) {
//   const candidate = data?.candidates?.[0];
//   const rawText =
//     candidate?.content?.parts?.[0]?.text ??
//     candidate?.content?.text ??
//     (typeof candidate === "string" ? candidate : JSON.stringify(candidate || ""));

//   // 1) Try parse as JSON directly
//   try {
//     return JSON.parse(rawText);
//   } catch {}

//   // 2) Try to find the first {...} JSON object inside the text
//   const jsonMatch = rawText.match(/\{[\s\S]*\}/);
//   if (jsonMatch) {
//     try {
//       return JSON.parse(jsonMatch[0]);
//     } catch {}
//   }

//   // 3) No JSON — return structured raw fallback
//   return { raw: rawText.trim() };
// }

// /* Translate disease label */
// async function translateDiseaseLabel(label: string, lang: LanguageCode) {
//   const cacheKey = `translate:${label}:${lang}`;
//   const cached = await getValidCache(cacheKey);
//   if (cached) return cached;

//   const systemPrompt = `You are Kisan Mitra, an agricultural assistant for Indian farmers. When asked to translate a model label, you MUST return only valid JSON (no extra commentary) with keys:
// - translated_name: a short translated name
// - common_name: a local/common name if available (optional)
// - short_desc: one-sentence description (optional)
// - label: original label

// If you cannot translate, return JSON with "translated_name" equal to the original label.`;

//   const userPrompt = `Translate the disease label exactly: "${label}" into language "${lang}" (${LANGUAGES[lang].name}). Use plain farmer-friendly wording. Output only valid JSON.`;

//   const body = {
//     contents: [
//       {
//         role: "user",
//         parts: [{ text: systemPrompt + "\n\n" + userPrompt }],
//       },
//     ],
//     generationConfig: {
//       temperature: 0.0,
//       maxOutputTokens: 256,
//       candidateCount: 1,
//     },
//   };

//   const data = await callGemini(body);
//   const parsed = await parseCandidateJson(data);
  
//   // Guarantee minimal shape
//   const result = {
//     translated_name: parsed.translated_name ?? parsed.common_name ?? parsed.label ?? parsed.raw ?? label,
//     common_name: parsed.common_name ?? null,
//     short_desc: parsed.short_desc ?? null,
//     raw: parsed.raw ?? null,
//   };

//   await setCache(cacheKey, result, 60 * 60 * 24 * 7);
//   return result;
// }

// /* Get treatment suggestions */
// async function getTreatmentsForLabel(label: string, lang: LanguageCode) {
//   const cacheKey = `treat:${label}:${lang}`;
//   const cached = await getValidCache(cacheKey);
//   if (cached) return cached;

//   const systemPrompt = `You are Kisan Mitra, an agricultural assistant for Indian farmers. Provide practical, farmer-friendly treatment options and safety precautions. Return ONLY valid JSON with keys:
// - title: short heading
// - summary: 1-2 line high-level summary
// - treatments: array of steps (each step may be string or object with step, materials, dosage, timing)
// - organic_options: array (optional)
// - chemical_options: array (optional)
// - precautions: short text (optional)

// Output must be valid JSON.`;

//   const userPrompt = `Detected disease label: "${label}". Provide short, practical treatments suitable for small-hold Indian farmers. Keep language natural and concise. Respond in the requested language: ${LANGUAGES[lang].name}. Return JSON only.`;

//   const body = {
//     contents: [
//       {
//         role: "user",
//         parts: [{ text: systemPrompt + "\n\n" + userPrompt }],
//       },
//     ],
//     generationConfig: {
//       temperature: 0.2,
//       maxOutputTokens: 1024,
//       candidateCount: 1,
//     },
//   };

//   const data = await callGemini(body);
//   const parsed = await parseCandidateJson(data);

//   // Normalize a helpful shape:
//   const result = {
//     title: parsed.title ?? `Treatments for ${label}`,
//     summary: parsed.summary ?? parsed.description ?? parsed.raw ?? null,
//     treatments: parsed.treatments ?? parsed.steps ?? (parsed.raw ? [String(parsed.raw)] : []),
//     organic_options: parsed.organic_options ?? parsed.organic ?? [],
//     chemical_options: parsed.chemical_options ?? parsed.chemical ?? [],
//     precautions: parsed.precautions ?? parsed.safety ?? null,
//     raw: parsed.raw ?? null,
//   };

//   await setCache(cacheKey, result, 60 * 60 * 24 * 7);
//   return result;
// }

// // --- Main component ---
// export default function ScanScreen() {
//   const [imageUri, setImageUri] = useState<string | null>(null);
//   const [uploading, setUploading] = useState(false);
//   const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
//   const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>("en");
//   const [showLanguageModal, setShowLanguageModal] = useState(false);
//   const [translation, setTranslation] = useState<any | null>(null);
//   const [treatment, setTreatment] = useState<any | null>(null);
//   const [loadingTranslate, setLoadingTranslate] = useState(false);
//   const [loadingTreat, setLoadingTreat] = useState(false);

//   const scrollRef = useRef<ScrollView | null>(null);

//   // Updated backend URL for new FastAPI backend
//   const BASE_URL = Platform.OS === "android" 
//     ? "http://local:3030" 
//     : "http://local:3030";
  
//   const PREDICT_URL = `${BASE_URL}/predict`;

//   // pickFromCamera and gallery
//   const pickFromCamera = async () => {
//     const result = await launchCamera({
//       mediaType: "photo",
//       cameraType: "back",
//       quality: 0.8,
//       saveToPhotos: false,
//     });
//     if (result.didCancel) return;
//     if (result.errorCode) {
//       Alert.alert("Camera error", result.errorMessage || "Unknown error");
//       return;
//     }
//     const uri = result.assets?.[0]?.uri;
//     if (uri) {
//       setImageUri(uri);
//       setPrediction(null);
//       setTranslation(null);
//       setTreatment(null);
//     }
//   };

//   const pickFromGallery = async () => {
//     const result = await launchImageLibrary({ mediaType: "photo", quality: 0.8 });
//     if (result.didCancel) return;
//     if (result.errorCode) {
//       Alert.alert("Picker error", result.errorMessage || "Unknown error");
//       return;
//     }
//     const uri = result.assets?.[0]?.uri;
//     if (uri) {
//       setImageUri(uri);
//       setPrediction(null);
//       setTranslation(null);
//       setTreatment(null);
//     }
//   };

//   // Upload image and get model prediction
//   const uploadImage = async () => {
//     if (!imageUri) {
//       Alert.alert("No image", "Please pick or take a photo first.");
//       return;
//     }
//     try {
//       setUploading(true);
//       setPrediction(null);
//       setTranslation(null);
//       setTreatment(null);

//       const filename = imageUri.split("/").pop() ?? "plant.jpg";
//       const match = /\.(\w+)$/.exec(filename);
//       const type = match ? `image/${match[1].toLowerCase()}` : "image/jpeg";

//       const formData = new FormData();
//       formData.append("file", {
//         // @ts-ignore RN FormData file shape
//         uri: Platform.OS === "android" ? imageUri : imageUri.replace("file://", ""),
//         name: filename,
//         type,
//       } as any);

//       const resp = await fetch(PREDICT_URL, {
//         method: "POST",
//         body: formData,
//       });
//       if (!resp.ok) {
//         const txt = await resp.text();
//         throw new Error(`Server ${resp.status}: ${txt}`);
//       }
//       const data: PredictionResponse = await resp.json();
//       setPrediction(data);

//       // Auto-translate the label
//       if (data?.predicted_class) {
//         await doTranslate(data.predicted_class, selectedLanguage);
//       }

//       // If not healthy -> auto-fetch treatment (only if model label isn't "healthy")
//       const isHealthy = /healthy/i.test(data.predicted_class || "");
//       if (!isHealthy) {
//         await doGetTreatment(data.predicted_class || "", selectedLanguage);
//       }
//     } catch (err: any) {
//       console.error("Upload error:", err);
//       Alert.alert("Upload failed", err?.message || "Failed to upload image");
//     } finally {
//       setUploading(false);
//     }
//   };

//   const doTranslate = async (label: string, lang: LanguageCode) => {
//     try {
//       setLoadingTranslate(true);
//       const tr = await translateDiseaseLabel(label, lang);
//       setTranslation(tr);
//     } catch (e: any) {
//       console.error("Translate error:", e);
//       setTranslation({ translated_name: label });
//     } finally {
//       setLoadingTranslate(false);
//     }
//   };

//   const doGetTreatment = async (label: string, lang: LanguageCode) => {
//     try {
//       setLoadingTreat(true);
//       const t = await getTreatmentsForLabel(label, lang);
//       setTreatment(t);
//     } catch (e: any) {
//       console.error("Treatment error:", e);
//       setTreatment({ raw: "Unable to fetch suggestions" });
//     } finally {
//       setLoadingTreat(false);
//     }
//   };

//   const changeLanguage = async (lang: LanguageCode) => {
//     setSelectedLanguage(lang);
//     setShowLanguageModal(false);
//     // re-run translate and treatment with new lang if prediction exists
//     if (prediction?.predicted_class) {
//       await doTranslate(prediction.predicted_class, lang);
//       const isHealthy = /healthy/i.test(prediction.predicted_class || "");
//       if (!isHealthy) {
//         await doGetTreatment(prediction.predicted_class, lang);
//       }
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Scan Plant</Text>
// <ScrollView>
//       <Card style={styles.card}>
//         <Card.Content style={styles.cardContent}>
//           {imageUri ? (
//             <Image source={{ uri: imageUri }} style={styles.preview} />
//           ) : (
//             <View style={styles.emptyPreview}>
//               <Text>No image selected</Text>
//             </View>
//           )}

//           <View style={styles.buttonRow}>
//             <Button mode="contained" icon="camera" onPress={pickFromCamera} style={styles.button}>
//               Camera
//             </Button>

//             <Button mode="outlined" icon="image" onPress={pickFromGallery} style={styles.button}>
//               Gallery
//             </Button>
//           </View>

//           <View style={styles.uploadRow}>
//             <Button mode="contained" onPress={uploadImage} disabled={!imageUri || uploading} contentStyle={{ paddingVertical: 6 }}>
//               {uploading ? "Uploading..." : "Upload & Predict"}
//             </Button>
//             {uploading && <ActivityIndicator style={styles.spinner} />}
//             <TouchableOpacity onPress={() => setShowLanguageModal(true)} style={{ marginLeft: 12 }}>
//               <View style={{ flexDirection: "row", alignItems: "center" }}>
//                 <Icon name="translate" size={22} color="#2E7D32" />
//                 <Text style={{ marginLeft: 6 }}>{LANGUAGES[selectedLanguage].name}</Text>
//               </View>
//             </TouchableOpacity>
//           </View>

//           {/* Prediction */}
//           {prediction && (
//             <View style={styles.result}>
//               <Text style={styles.resultLabel}>Prediction</Text>
//               <Text style={styles.resultText}>
//                 {prediction.predicted_class} — {(prediction.confidence * 100).toFixed(1)}%
//               </Text>
              
//               {/* Show top 3 predictions */}
//               {prediction.top_3_predictions && prediction.top_3_predictions.length > 0 && (
//                 <View style={{ marginTop: 8 }}>
//                   <Text style={{ fontWeight: "600", fontSize: 14, color: "#555" }}>Top 3 Predictions:</Text>
//                   {prediction.top_3_predictions.map((pred, idx) => (
//                     <Text key={idx} style={{ fontSize: 13, color: "#666", marginTop: 4 }}>
//                       {idx + 1}. {pred.class} — {(pred.confidence * 100).toFixed(1)}%
//                     </Text>
//                   ))}
//                 </View>
//               )}
//             </View>
//           )}

//           {/* Translation */}
//           {loadingTranslate ? (
//             <View style={{ marginTop: 12 }}>
//               <ActivityIndicator />
//             </View>
//           ) : translation ? (
//             <View style={{ marginTop: 12 }}>
//               <Text style={{ fontWeight: "700" }}>In {LANGUAGES[selectedLanguage].name}:</Text>
//               <Text style={{ fontSize: 18, marginTop: 6 }}>{translation.translated_name ?? translation.common_name ?? translation.label ?? translation.raw}</Text>
//               {translation.short_desc ? <Text style={{ marginTop: 6 }}>{translation.short_desc}</Text> : null}
//             </View>
//           ) : null}

//           {/* Treatment */}
//           {loadingTreat ? (
//             <View style={{ marginTop: 12 }}>
//               <ActivityIndicator />
//             </View>
//           ) : treatment ? (
//             <View style={{ marginTop: 12 }}>
//               <Text style={{ fontWeight: "800", fontSize: 16 }}>{treatment.title ?? "Suggested treatments"}</Text>
//               {treatment.summary ? <Text style={{ marginTop: 6 }}>{treatment.summary}</Text> : null}
//               {Array.isArray(treatment.treatments) &&
//                 treatment.treatments.map((s: any, i: number) => (
//                   <View key={i} style={{ marginTop: 8 }}>
//                     <Text style={{ fontWeight: "700" }}>{i + 1}. {typeof s === 'string' ? s : s.step ?? s}</Text>
//                     {typeof s === 'object' && s.materials ? <Text>Materials: {s.materials}</Text> : null}
//                     {typeof s === 'object' && s.dosage ? <Text>Dosage: {s.dosage}</Text> : null}
//                     {typeof s === 'object' && s.timing ? <Text>Timing: {s.timing}</Text> : null}
//                   </View>
//                 ))}
//               {/* fallback raw */}
//               {treatment.raw && <Text style={{ marginTop: 8 }}>{String(treatment.raw)}</Text>}
//             </View>
//           ) : null}
//         </Card.Content>
//       </Card>
// </ScrollView>
//       {/* Language selection modal */}
//       <Modal visible={showLanguageModal} transparent animationType="slide" onRequestClose={() => setShowLanguageModal(false)}>
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>Select Language</Text>
//               <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
//                 <Icon name="close" size={24} color="#333" />
//               </TouchableOpacity>
//             </View>

//             {(Object.entries(LANGUAGES) as [LanguageCode, Language][]).map(([code, lang]) => (
//               <TouchableOpacity
//                 key={code}
//                 style={[styles.languageOption, selectedLanguage === code && styles.selectedLanguage]}
//                 onPress={() => changeLanguage(code as LanguageCode)}
//               >
//                 <Text style={styles.languageName}>{lang.name}</Text>
//                 {selectedLanguage === code && <Icon name="check-circle" size={24} color="#2E7D32" />}
//               </TouchableOpacity>
//             ))}
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#E9F5E9", padding: 16, paddingTop: 36 },
//   title: { fontSize: 28, fontWeight: "700", color: "#2E7D32", marginBottom: 12, textAlign: "center" },
//   card: { borderRadius: 12, paddingVertical: 12, elevation: 3 },
//   cardContent: { gap: 12 },
//   emptyPreview: {
//     height: 220,
//     borderRadius: 8,
//     backgroundColor: "#fbfff8",
//     alignItems: "center",
//     justifyContent: "center",
//     borderWidth: 1,
//     borderColor: "#e6f0e6",
//   },
//   preview: { width: "100%", height: 220, borderRadius: 8, resizeMode: "cover" },
//   buttonRow: { flexDirection: "row", justifyContent: "space-between", gap: 12, marginTop: 8 },
//   button: { flex: 1, marginHorizontal: 6 },
//   uploadRow: { marginTop: 12, flexDirection: "row", alignItems: "center", gap: 12 },
//   spinner: { marginLeft: 12 },
//   result: { marginTop: 14, paddingTop: 8, borderTopWidth: 1, borderTopColor: "#eef6ee" },
//   resultLabel: { fontSize: 16, fontWeight: "700", color: "#2E7D32" },
//   resultText: { fontSize: 18, fontWeight: "600", marginTop: 6 },

//   modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
//   modalContent: { backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 30 },
//   modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, borderBottomWidth: 1, borderBottomColor: "#eee" },
//   modalTitle: { fontSize: 18, fontWeight: "700", color: "#333" },
//   languageOption: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
//   selectedLanguage: { backgroundColor: "#f0f8f0" },
//   languageName: { fontSize: 16, color: "#333", flex: 1 },
// });
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  Modal,
  Keyboard,
} from "react-native";
import { Button, Card } from "react-native-paper";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

type PredictionResponse = {
  predicted_class: string;
  confidence: number;
  top_3_predictions: Array<{
    class: string;
    confidence: number;
  }>;
};

// --- CONFIG - Get free API key from: https://console.groq.com ---
const GROQ_API_KEY = "";
const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

// --- Languages ---
type LanguageCode = "en" | "kn" | "hi" | "te" | "ta";
interface Language {
  name: string;
  greeting: string;
}
const LANGUAGES: Record<LanguageCode, Language> = {
  en: { name: "English", greeting: "Hello Farmer Friend! How can I help you today?" },
  kn: { name: "ಕನ್ನಡ", greeting: "ನಮಸ್ಕಾರ ರೈತ ಮಿತ್ರ! ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?" },
  hi: { name: "हिंदी", greeting: "नमस्ते किसान मित्र! मैं आपकी कैसे मदद कर सकता हूं?" },
  te: { name: "తెలుగు", greeting: "నమస్కారం రైతు మిత్రమా! నేను మీకు ఎలా సహాయం చేయగలను?" },
  ta: { name: "தமிழ்", greeting: "வணக்கம் விவசாயி நண்பரே! நான் உங்களுக்கு எப்படி உதவ முடியும்?" },
};

// --- Simple cache helpers using AsyncStorage ---
async function getValidCache(key: string) {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.expires && Date.now() > parsed.expires) {
      await AsyncStorage.removeItem(key);
      return null;
    }
    return parsed.value;
  } catch {
    return null;
  }
}
async function setCache(key: string, value: any, ttlSeconds = 60 * 60 * 24 * 7) {
  const wrapped = { value, expires: Date.now() + ttlSeconds * 1000 };
  try {
    await AsyncStorage.setItem(key, JSON.stringify(wrapped));
  } catch {}
}

// --- Groq call helper ---
async function callGroq(systemPrompt: string, userPrompt: string, temperature: number = 0.7) {
  const resp = await fetch(GROQ_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: temperature,
      max_tokens: 1024,
    }),
  });

  if (!resp.ok) {
    const errorText = await resp.text();
    throw new Error(`Groq API ${resp.status}: ${errorText}`);
  }

  const data = await resp.json();
  const content = data?.choices?.[0]?.message?.content || "";
  
  return content;
}

/**
 * Parse JSON from Groq response
 */
function parseGroqJson(content: string) {
  // Try to parse as JSON directly
  try {
    return JSON.parse(content);
  } catch {}

  // Try to find JSON object in the text
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch {}
  }

  // No JSON found - return raw text
  return { raw: content.trim() };
}

/* Translate disease label */
async function translateDiseaseLabel(label: string, lang: LanguageCode) {
  const cacheKey = `translate:${label}:${lang}`;
  const cached = await getValidCache(cacheKey);
  if (cached) return cached;

  const systemPrompt = `You are Kisan Mitra, an agricultural assistant for Indian farmers. When asked to translate a model label, you MUST return only valid JSON (no extra commentary) with keys:
- translated_name: a short translated name
- common_name: a local/common name if available (optional)
- short_desc: one-sentence description (optional)
- label: original label

If you cannot translate, return JSON with "translated_name" equal to the original label.`;

  const userPrompt = `Translate the disease label exactly: "${label}" into language "${lang}" (${LANGUAGES[lang].name}). Use plain farmer-friendly wording. Output only valid JSON.`;

  try {
    const content = await callGroq(systemPrompt, userPrompt, 0.0);
    const parsed = parseGroqJson(content);
    
    // Guarantee minimal shape
    const result = {
      translated_name: parsed.translated_name ?? parsed.common_name ?? parsed.label ?? parsed.raw ?? label,
      common_name: parsed.common_name ?? null,
      short_desc: parsed.short_desc ?? null,
      raw: parsed.raw ?? null,
    };

    await setCache(cacheKey, result, 60 * 60 * 24 * 7);
    return result;
  } catch (error) {
    console.error("Translation error:", error);
    return {
      translated_name: label,
      common_name: null,
      short_desc: null,
      raw: null,
    };
  }
}

/* Get treatment suggestions */
async function getTreatmentsForLabel(label: string, lang: LanguageCode) {
  const cacheKey = `treat:${label}:${lang}`;
  const cached = await getValidCache(cacheKey);
  if (cached) return cached;

  const systemPrompt = `You are Kisan Mitra, an agricultural assistant for Indian farmers. Provide practical, farmer-friendly treatment options and safety precautions. Return ONLY valid JSON with keys:
- title: short heading
- summary: 1-2 line high-level summary
- treatments: array of steps (each step may be string or object with step, materials, dosage, timing)
- organic_options: array (optional)
- chemical_options: array (optional)
- precautions: short text (optional)

Output must be valid JSON.`;

  const userPrompt = `Detected disease label: "${label}". Provide short, practical treatments suitable for small-hold Indian farmers. Keep language natural and concise. Respond in the requested language: ${LANGUAGES[lang].name}. Return JSON only.`;

  try {
    const content = await callGroq(systemPrompt, userPrompt, 0.2);
    const parsed = parseGroqJson(content);

    // Normalize a helpful shape:
    const result = {
      title: parsed.title ?? `Treatments for ${label}`,
      summary: parsed.summary ?? parsed.description ?? parsed.raw ?? null,
      treatments: parsed.treatments ?? parsed.steps ?? (parsed.raw ? [String(parsed.raw)] : []),
      organic_options: parsed.organic_options ?? parsed.organic ?? [],
      chemical_options: parsed.chemical_options ?? parsed.chemical ?? [],
      precautions: parsed.precautions ?? parsed.safety ?? null,
      raw: parsed.raw ?? null,
    };

    await setCache(cacheKey, result, 60 * 60 * 24 * 7);
    return result;
  } catch (error) {
    console.error("Treatment error:", error);
    return {
      title: `Treatments for ${label}`,
      summary: "Unable to fetch treatment suggestions at this time.",
      treatments: [],
      organic_options: [],
      chemical_options: [],
      precautions: null,
      raw: null,
    };
  }
}

// --- Main component ---
export default function ScanScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>("en");
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [translation, setTranslation] = useState<any | null>(null);
  const [treatment, setTreatment] = useState<any | null>(null);
  const [loadingTranslate, setLoadingTranslate] = useState(false);
  const [loadingTreat, setLoadingTreat] = useState(false);

  const scrollRef = useRef<ScrollView | null>(null);

  // Updated backend URL for new FastAPI backend
  const BASE_URL = Platform.OS === "android" 
    ? "http://localhost:3030" 
    : "http://localhost:3030";
  
  const PREDICT_URL = `${BASE_URL}/predict`;

  // pickFromCamera and gallery
  const pickFromCamera = async () => {
    const result = await launchCamera({
      mediaType: "photo",
      cameraType: "back",
      quality: 0.8,
      saveToPhotos: false,
    });
    if (result.didCancel) return;
    if (result.errorCode) {
      Alert.alert("Camera error", result.errorMessage || "Unknown error");
      return;
    }
    const uri = result.assets?.[0]?.uri;
    if (uri) {
      setImageUri(uri);
      setPrediction(null);
      setTranslation(null);
      setTreatment(null);
    }
  };

  const pickFromGallery = async () => {
    const result = await launchImageLibrary({ mediaType: "photo", quality: 0.8 });
    if (result.didCancel) return;
    if (result.errorCode) {
      Alert.alert("Picker error", result.errorMessage || "Unknown error");
      return;
    }
    const uri = result.assets?.[0]?.uri;
    if (uri) {
      setImageUri(uri);
      setPrediction(null);
      setTranslation(null);
      setTreatment(null);
    }
  };

  // Upload image and get model prediction
  const uploadImage = async () => {
    if (!imageUri) {
      Alert.alert("No image", "Please pick or take a photo first.");
      return;
    }
    try {
      setUploading(true);
      setPrediction(null);
      setTranslation(null);
      setTreatment(null);

      const filename = imageUri.split("/").pop() ?? "plant.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1].toLowerCase()}` : "image/jpeg";

      const formData = new FormData();
      formData.append("file", {
        // @ts-ignore RN FormData file shape
        uri: Platform.OS === "android" ? imageUri : imageUri.replace("file://", ""),
        name: filename,
        type,
      } as any);

      const resp = await fetch(PREDICT_URL, {
        method: "POST",
        body: formData,
      });
      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(`Server ${resp.status}: ${txt}`);
      }
      const data: PredictionResponse = await resp.json();
      setPrediction(data);

      // Auto-translate the label
      if (data?.predicted_class) {
        await doTranslate(data.predicted_class, selectedLanguage);
      }

      // If not healthy -> auto-fetch treatment (only if model label isn't "healthy")
      const isHealthy = /healthy/i.test(data.predicted_class || "");
      if (!isHealthy) {
        await doGetTreatment(data.predicted_class || "", selectedLanguage);
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      Alert.alert("Upload failed", err?.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const doTranslate = async (label: string, lang: LanguageCode) => {
    try {
      setLoadingTranslate(true);
      const tr = await translateDiseaseLabel(label, lang);
      setTranslation(tr);
    } catch (e: any) {
      console.error("Translate error:", e);
      setTranslation({ translated_name: label });
    } finally {
      setLoadingTranslate(false);
    }
  };

  const doGetTreatment = async (label: string, lang: LanguageCode) => {
    try {
      setLoadingTreat(true);
      const t = await getTreatmentsForLabel(label, lang);
      setTreatment(t);
    } catch (e: any) {
      console.error("Treatment error:", e);
      setTreatment({ raw: "Unable to fetch suggestions" });
    } finally {
      setLoadingTreat(false);
    }
  };

  const changeLanguage = async (lang: LanguageCode) => {
    setSelectedLanguage(lang);
    setShowLanguageModal(false);
    // re-run translate and treatment with new lang if prediction exists
    if (prediction?.predicted_class) {
      await doTranslate(prediction.predicted_class, lang);
      const isHealthy = /healthy/i.test(prediction.predicted_class || "");
      if (!isHealthy) {
        await doGetTreatment(prediction.predicted_class, lang);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scan Plant</Text>
<ScrollView>
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.preview} />
          ) : (
            <View style={styles.emptyPreview}>
              <Text>No image selected</Text>
            </View>
          )}

          <View style={styles.buttonRow}>
            <Button mode="contained" icon="camera" onPress={pickFromCamera} style={styles.button}>
              Camera
            </Button>

            <Button mode="outlined" icon="image" onPress={pickFromGallery} style={styles.button}>
              Gallery
            </Button>
          </View>

          <View style={styles.uploadRow}>
            <Button mode="contained" onPress={uploadImage} disabled={!imageUri || uploading} contentStyle={{ paddingVertical: 6 }}>
              {uploading ? "Uploading..." : "Upload & Predict"}
            </Button>
            {uploading && <ActivityIndicator style={styles.spinner} />}
            <TouchableOpacity onPress={() => setShowLanguageModal(true)} style={{ marginLeft: 12 }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Icon name="translate" size={22} color="#2E7D32" />
                <Text style={{ marginLeft: 6 }}>{LANGUAGES[selectedLanguage].name}</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Prediction */}
          {prediction && (
            <View style={styles.result}>
              <Text style={styles.resultLabel}>Prediction</Text>
              <Text style={styles.resultText}>
                {prediction.predicted_class} — {(prediction.confidence * 100).toFixed(1)}%
              </Text>
              
              {/* Show top 3 predictions */}
              {prediction.top_3_predictions && prediction.top_3_predictions.length > 0 && (
                <View style={{ marginTop: 8 }}>
                  <Text style={{ fontWeight: "600", fontSize: 14, color: "#555" }}>Top 3 Predictions:</Text>
                  {prediction.top_3_predictions.map((pred, idx) => (
                    <Text key={idx} style={{ fontSize: 13, color: "#666", marginTop: 4 }}>
                      {idx + 1}. {pred.class} — {(pred.confidence * 100).toFixed(1)}%
                    </Text>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Translation */}
          {loadingTranslate ? (
            <View style={{ marginTop: 12 }}>
              <ActivityIndicator />
            </View>
          ) : translation ? (
            <View style={{ marginTop: 12 }}>
              <Text style={{ fontWeight: "700" }}>In {LANGUAGES[selectedLanguage].name}:</Text>
              <Text style={{ fontSize: 18, marginTop: 6 }}>{translation.translated_name ?? translation.common_name ?? translation.label ?? translation.raw}</Text>
              {translation.short_desc ? <Text style={{ marginTop: 6 }}>{translation.short_desc}</Text> : null}
            </View>
          ) : null}

          {/* Treatment */}
          {loadingTreat ? (
            <View style={{ marginTop: 12 }}>
              <ActivityIndicator />
            </View>
          ) : treatment ? (
            <View style={{ marginTop: 12 }}>
              <Text style={{ fontWeight: "800", fontSize: 16 }}>{treatment.title ?? "Suggested treatments"}</Text>
              {treatment.summary ? <Text style={{ marginTop: 6 }}>{treatment.summary}</Text> : null}
              {Array.isArray(treatment.treatments) &&
                treatment.treatments.map((s: any, i: number) => (
                  <View key={i} style={{ marginTop: 8 }}>
                    <Text style={{ fontWeight: "700" }}>{i + 1}. {typeof s === 'string' ? s : s.step ?? s}</Text>
                    {typeof s === 'object' && s.materials ? <Text>Materials: {s.materials}</Text> : null}
                    {typeof s === 'object' && s.dosage ? <Text>Dosage: {s.dosage}</Text> : null}
                    {typeof s === 'object' && s.timing ? <Text>Timing: {s.timing}</Text> : null}
                  </View>
                ))}
              {/* fallback raw */}
              {treatment.raw && <Text style={{ marginTop: 8 }}>{String(treatment.raw)}</Text>}
            </View>
          ) : null}
        </Card.Content>
      </Card>
</ScrollView>
      {/* Language selection modal */}
      <Modal visible={showLanguageModal} transparent animationType="slide" onRequestClose={() => setShowLanguageModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Language</Text>
              <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {(Object.entries(LANGUAGES) as [LanguageCode, Language][]).map(([code, lang]) => (
              <TouchableOpacity
                key={code}
                style={[styles.languageOption, selectedLanguage === code && styles.selectedLanguage]}
                onPress={() => changeLanguage(code as LanguageCode)}
              >
                <Text style={styles.languageName}>{lang.name}</Text>
                {selectedLanguage === code && <Icon name="check-circle" size={24} color="#2E7D32" />}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E9F5E9", padding: 16, paddingTop: 36 },
  title: { fontSize: 28, fontWeight: "700", color: "#2E7D32", marginBottom: 12, textAlign: "center" },
  card: { borderRadius: 12, paddingVertical: 12, elevation: 3 },
  cardContent: { gap: 12 },
  emptyPreview: {
    height: 220,
    borderRadius: 8,
    backgroundColor: "#fbfff8",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e6f0e6",
  },
  preview: { width: "100%", height: 220, borderRadius: 8, resizeMode: "cover" },
  buttonRow: { flexDirection: "row", justifyContent: "space-between", gap: 12, marginTop: 8 },
  button: { flex: 1, marginHorizontal: 6 },
  uploadRow: { marginTop: 12, flexDirection: "row", alignItems: "center", gap: 12 },
  spinner: { marginLeft: 12 },
  result: { marginTop: 14, paddingTop: 8, borderTopWidth: 1, borderTopColor: "#eef6ee" },
  resultLabel: { fontSize: 16, fontWeight: "700", color: "#2E7D32" },
  resultText: { fontSize: 18, fontWeight: "600", marginTop: 6 },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 30 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, borderBottomWidth: 1, borderBottomColor: "#eee" },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#333" },
  languageOption: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  selectedLanguage: { backgroundColor: "#f0f8f0" },
  languageName: { fontSize: 16, color: "#333", flex: 1 },
});