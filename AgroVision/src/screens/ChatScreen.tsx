import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Text,
  Keyboard,
  Modal,
} from "react-native";
import axios from "axios";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

type LanguageCode = 'en' | 'kn' | 'hi' | 'te' | 'ta';

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

// Get free Groq API key from: https://console.groq.com
const GROQ_API_KEY = "";

export default function ChatScreen() {
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>("en");
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [messages, setMessages] = useState([
    { role: "bot", content: `🌱 ${LANGUAGES.en.greeting}` },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<ScrollView | null>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        scrollToBottom();
      }
    );

    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);

  const changeLanguage = (langCode: LanguageCode) => {
    setSelectedLanguage(langCode);
    setMessages([
      { role: "bot", content: `🌱 ${LANGUAGES[langCode].greeting}` },
    ]);
    setShowLanguageModal(false);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    scrollToBottom();

    try {
      const languageInstruction: Record<LanguageCode, string> = {
        en: "Respond in English",
        kn: "Respond in Kannada (ಕನ್ನಡ)",
        hi: "Respond in Hindi (हिंदी)",
        te: "Respond in Telugu (తెలుగు)",
        ta: "Respond in Tamil (தமிழ்)",
      };

      const systemPrompt = `You are Kisan Mitra, a helpful farming assistant. ${languageInstruction[selectedLanguage]}. Provide agricultural advice, crop information, weather guidance, and farming tips. Keep responses clear and farmer-friendly. ONLY answer questions related to Indian agriculture, farming, crop yields, weather patterns affecting Indian farming, agricultural policies in India, and farming techniques relevant to Indian conditions. If asked about any other topics, politely decline to answer and remind that you're specialized in Indian agriculture only. Remember: Respond ONLY in ${LANGUAGES[selectedLanguage].name} language.`;

      // Groq API call (FREE!)
      const res = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            {
              role: "user",
              content: userMsg.content
            }
          ],
          model: "llama-3.3-70b-versatile", // Fast and free model
          temperature: 0.7,
          max_tokens: 1024
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${GROQ_API_KEY}`
          }
        }
      );

      const reply =
        res.data?.choices?.[0]?.message?.content ||
        "Sorry, I couldn't understand.";

      setMessages((prev) => [...prev, { role: "bot", content: reply }]);
    } catch (err: any) {
      console.log("FULL ERROR:", err);
      console.log("ERROR RESPONSE:", err.response?.data);
      console.log("ERROR STATUS:", err.response?.status);

      let errorMessage = "";
      
      if (err.response?.status === 403) {
        const errorMessages: Record<LanguageCode, string> = {
          en: "Error 403: Invalid API key. Please check your Groq API key.",
          kn: "ದೋಷ 403: ಅಮಾನ್ಯ API ಕೀ. ದಯವಿಟ್ಟು ನಿಮ್ಮ Groq API ಕೀ ಪರಿಶೀಲಿಸಿ.",
          hi: "त्रुटि 403: अमान्य API कुंजी। कृपया अपनी Groq API कुंजी जांचें।",
          te: "లోపం 403: చెల్లని API కీ. దయచేసి మీ Groq API కీని తనిఖీ చేయండి.",
          ta: "பிழை 403: தவறான API விசை. உங்கள் Groq API விசையை சரிபார்க்கவும்.",
        };
        errorMessage = errorMessages[selectedLanguage];
      } else if (err.response?.status === 401) {
        const errorMessages: Record<LanguageCode, string> = {
          en: "Error 401: Unauthorized. Please check your API key.",
          kn: "ದೋಷ 401: ಅನಧಿಕೃತ. ದಯವಿಟ್ಟು ನಿಮ್ಮ API ಕೀ ಪರಿಶೀಲಿಸಿ.",
          hi: "त्रुटि 401: अनधिकृत। कृपया अपनी API कुंजी जांचें।",
          te: "లోపం 401: అనధికారం. దయచేసి మీ API కీని తనిఖీ చేయండి.",
          ta: "பிழை 401: அங்கீகரிக்கப்படவில்லை. உங்கள் API விசையை சரிபார்க்கவும்.",
        };
        errorMessage = errorMessages[selectedLanguage];
      } else {
        const errorMessages: Record<LanguageCode, string> = {
          en: "Error: Unable to connect to server.",
          kn: "ದೋಷ: ಸರ್ವರ್‌ಗೆ ಸಂಪರ್ಕಿಸಲು ಸಾಧ್ಯವಾಗುತ್ತಿಲ್ಲ.",
          hi: "त्रुटि: सर्वर से कनेक्ट नहीं हो पा रहा है।",
          te: "లోపం: సర్వర్‌కు కనెక్ట్ చేయడం సాధ్యం కాలేదు.",
          ta: "பிழை: சர்வரை இணைக்க முடியவில்லை.",
        };
        errorMessage = errorMessages[selectedLanguage];
      }
      
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: errorMessage },
      ]);
    }

    scrollToBottom();
  };

  const placeholderText: Record<LanguageCode, string> = {
    en: "Type your message...",
    kn: "ನಿಮ್ಮ ಸಂದೇಶವನ್ನು ಟೈಪ್ ಮಾಡಿ...",
    hi: "अपना संदेश टाइप करें...",
    te: "మీ సందేశాన్ని టైప్ చేయండి...",
    ta: "உங்கள் செய்தியை தட்டச்சு செய்யுங்கள்...",
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerText}>Kisan Mitra Chatbot</Text>
            <TouchableOpacity
              style={styles.languageBtn}
              onPress={() => setShowLanguageModal(true)}
            >
              <Text style={styles.languageText}>
                {LANGUAGES[selectedLanguage].name}
              </Text>
              <Icon name="arrow-drop-down" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Chat messages */}
          <ScrollView
            ref={scrollRef}
            style={styles.messagesContainer}
            contentContainerStyle={{ paddingBottom: 20 }}
            keyboardShouldPersistTaps="handled"
          >
            {messages.map((msg, idx) => (
              <View
                key={idx}
                style={[
                  styles.messageBubble,
                  msg.role === "user" ? styles.userBubble : styles.botBubble,
                ]}
              >
                <Text
                  style={{
                    color: msg.role === "user" ? "#fff" : "#000",
                    fontSize: 16,
                  }}
                >
                  {msg.content}
                </Text>
              </View>
            ))}
          </ScrollView>

          {/* Chat input */}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder={placeholderText[selectedLanguage]}
              value={input}
              onChangeText={setInput}
              multiline={true}
              onFocus={scrollToBottom}
              placeholderTextColor="#858383ff"
            />

            <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
              <Icon name="send" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Language Selection Modal */}
        <Modal
          visible={showLanguageModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowLanguageModal(false)}
        >
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
                  style={[
                    styles.languageOption,
                    selectedLanguage === code && styles.selectedLanguage,
                  ]}
                  onPress={() => changeLanguage(code)}
                >
                  <Text style={styles.languageName}>{lang.name}</Text>
                  {selectedLanguage === code && (
                    <Icon name="check-circle" size={24} color="#2E7D32" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F0F8F0" },

  container: {
    flex: 1,
    backgroundColor: "#F0F8F0",
  },

  header: {
    padding: 16,
    backgroundColor: "#2E7D32",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerText: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "700",
  },

  languageBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  languageText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
    marginRight: 4,
  },

  messagesContainer: {
    flex: 1,
    paddingHorizontal: 12,
    marginTop: 10,
  },

  messageBubble: {
    padding: 12,
    marginVertical: 6,
    maxWidth: "80%",
    borderRadius: 12,
  },

  userBubble: {
    backgroundColor: "#2E7D32",
    alignSelf: "flex-end",
    borderBottomRightRadius: 0,
  },

  botBubble: {
    backgroundColor: "#fff",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 0,
  },

  inputRow: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    alignItems: "center",
  },

  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#F4F4F4",
    borderRadius: 20,
    fontSize: 15,
  },

  sendBtn: {
    width: 48,
    height: 48,
    marginLeft: 10,
    borderRadius: 24,
    backgroundColor: "#2E7D32",
    justifyContent: "center",
    alignItems: "center",
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
    paddingBottom: 30,
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

  languageOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },

  selectedLanguage: {
    backgroundColor: "#f0f8f0",
  },

  languageName: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  }
});