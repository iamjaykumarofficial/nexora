import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { setSelectedPrompts, PromptItem } from "../../lib/promptStore";

const API_BASE_URL = "http://192.168.1.102:5000/api";

type BackendPrompt = {
  id: number;
  question: string;
};

const FALLBACK_PROMPTS: BackendPrompt[] = [
  { id: 1, question: "I'm oddly competitive about" },
  { id: 2, question: "Together, we could" },
  { id: 3, question: "The way to win me over is" },
  { id: 4, question: "My simple pleasures" },
  { id: 5, question: "I go crazy for" },
  { id: 6, question: "A life goal of mine" },
  { id: 7, question: "The best way to ask me out is" },
  { id: 8, question: "My most irrational fear" },
  { id: 9, question: "I geek out on" },
  { id: 10, question: "My love language is" },
  { id: 11, question: "I'm looking for someone who" },
  { id: 12, question: "Two truths and a lie" },
  { id: 13, question: "The key to my heart is" },
  { id: 14, question: "My ideal Sunday" },
  { id: 15, question: "You'll know I'm into you if" },
];

const MAX_PROMPTS = 3;

export default function PromptsScreen() {
  const [availablePrompts, setAvailablePrompts] =
    useState<BackendPrompt[]>(FALLBACK_PROMPTS);
  const [selected, setSelected] = useState<PromptItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState<BackendPrompt | null>(
    null
  );
  const [currentAnswer, setCurrentAnswer] = useState("");

  useEffect(() => {
    loadPrompts();
  }, []);

  const loadPrompts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/prompts`);
      if (!response.ok) throw new Error("Failed");
      const data = await response.json();
      const list = Array.isArray(data)
        ? data
        : data?.prompts || data?.data || [];
      if (list.length > 0) {
        setAvailablePrompts(
          list
            .map((p: any) => ({
              id: Number(p.id),
              question: p.question || p.title || "",
            }))
            .filter((p: BackendPrompt) => p.question)
        );
      }
    } catch (err) {
      console.log("Prompts API fallback used", err);
    } finally {
      setLoading(false);
    }
  };

  const openAddPrompt = (prompt: BackendPrompt) => {
    if (selected.length >= MAX_PROMPTS) {
      Alert.alert("Maximum reached", "You can add up to 3 prompts.");
      return;
    }
    if (selected.some((p) => p.promptId === prompt.id)) {
      Alert.alert("Already added", "You already selected this prompt.");
      return;
    }
    setCurrentPrompt(prompt);
    setCurrentAnswer("");
    setModalVisible(true);
  };

  const savePrompt = () => {
    const answer = currentAnswer.trim();
    if (!currentPrompt || answer.length < 3) {
      Alert.alert("Too short", "Please write at least a few words.");
      return;
    }

    const newItem: PromptItem = {
      id: `${Date.now()}-${Math.random()}`,
      promptId: currentPrompt.id,
      question: currentPrompt.question,
      answer,
    };

    setSelected((prev) => [...prev, newItem].slice(0, MAX_PROMPTS));
    setModalVisible(false);
    setCurrentAnswer("");
    setCurrentPrompt(null);
  };

  const removePrompt = (id: string) => {
    setSelected((prev) => prev.filter((p) => p.id !== id));
  };

  const handleContinue = () => {
    setSelectedPrompts(selected);
    router.push("/onboarding/looking-for");   // ← yahan change kiya
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <LinearGradient
        colors={["#F8F3E9", "#F5EEE2", "#E9F0E7"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <View style={styles.backgroundCircleTop} />
        <View style={styles.backgroundCircleBottom} />

        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.backArrow}>‹</Text>
          </Pressable>

          <View style={styles.progressWrapper}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: "90%" }]} />
            </View>
            <Text style={styles.progressText}>Prompts</Text>
          </View>

          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.heading}>
            <Text style={styles.eyebrow}>SHOW YOUR PERSONALITY</Text>
            <Text style={styles.title}>
              Add up to{"\n"}
              <Text style={styles.titleAccent}>3 prompts.</Text>
            </Text>
            <Text style={styles.subtitle}>
              Answer fun prompts so people know how to start a conversation with
              you.
            </Text>
          </View>

          {loading && (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color="#244735" />
              <Text style={styles.loadingText}>Loading prompts...</Text>
            </View>
          )}

          {selected.length > 0 && (
            <View style={styles.selectedSection}>
              <Text style={styles.sectionLabel}>
                YOUR PROMPTS ({selected.length}/{MAX_PROMPTS})
              </Text>
              {selected.map((item) => (
                <View key={item.id} style={styles.promptCard}>
                  <Text style={styles.promptQuestion}>{item.question}</Text>
                  <Text style={styles.promptAnswer}>{item.answer}</Text>
                  <Pressable
                    onPress={() => removePrompt(item.id)}
                    style={styles.removeBtn}
                  >
                    <Text style={styles.removeText}>×</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          )}

          <View style={styles.availableSection}>
            <Text style={styles.sectionLabel}>CHOOSE A PROMPT</Text>
            <View style={styles.chips}>
              {availablePrompts.map((p) => {
                const already = selected.some((s) => s.promptId === p.id);
                const disabled = already || selected.length >= MAX_PROMPTS;
                return (
                  <Pressable
                    key={p.id}
                    disabled={disabled}
                    onPress={() => openAddPrompt(p)}
                    style={({ pressed }) => [
                      styles.chip,
                      disabled && styles.chipDisabled,
                      pressed && !disabled && styles.chipPressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        disabled && styles.chipTextDisabled,
                      ]}
                    >
                      {p.question}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </ScrollView>

        <View style={styles.bottomSection}>
          <Pressable
            onPress={handleContinue}
            style={({ pressed }) => [
              styles.continueButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <LinearGradient
              colors={["#244735", "#315C43"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <Text style={styles.continueText}>
                {selected.length === 0 ? "Skip for now" : "Continue"}
              </Text>
              <View style={styles.arrowCircle}>
                <Text style={styles.arrow}>→</Text>
              </View>
            </LinearGradient>
          </Pressable>
          <Text style={styles.bottomText}>
            You can edit prompts anytime later.
          </Text>
        </View>

        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <KeyboardAvoidingView
            style={styles.modalOverlay}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <Pressable
              style={styles.modalBackdrop}
              onPress={() => setModalVisible(false)}
            />
            <View style={styles.modalContainer}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalEyebrow}>YOUR ANSWER</Text>
              <Text style={styles.modalTitle}>{currentPrompt?.question}</Text>

              <TextInput
                value={currentAnswer}
                onChangeText={setCurrentAnswer}
                placeholder="Write your answer..."
                placeholderTextColor="#9A9F9B"
                multiline
                maxLength={150}
                style={styles.answerInput}
                autoFocus
              />
              <Text style={styles.charCount}>{currentAnswer.length}/150</Text>

              <Pressable
                onPress={savePrompt}
                style={({ pressed }) => [
                  styles.saveButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.saveText}>Add Prompt</Text>
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8F3E9",
  },
  container: {
    flex: 1,
    paddingHorizontal: 22,
    overflow: "hidden",
  },
  backgroundCircleTop: {
    position: "absolute",
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: "rgba(190,211,190,0.22)",
    top: -130,
    right: -90,
  },
  backgroundCircleBottom: {
    position: "absolute",
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: "rgba(226,177,138,0.13)",
    bottom: -100,
    left: -100,
  },
  header: {
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.65)",
    alignItems: "center",
    justifyContent: "center",
  },
  backArrow: {
    color: "#244735",
    fontSize: 34,
    lineHeight: 36,
    marginTop: -4,
  },
  progressWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  progressTrack: {
    width: 90,
    height: 5,
    borderRadius: 5,
    backgroundColor: "#DDE3DA",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#244735",
    borderRadius: 5,
  },
  progressText: {
    color: "#7D867E",
    fontSize: 11,
    fontWeight: "600",
  },
  headerSpacer: {
    width: 42,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  heading: {
    paddingTop: 26,
    marginBottom: 22,
  },
  eyebrow: {
    color: "#718172",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 2.2,
    marginBottom: 9,
  },
  title: {
    color: "#20382B",
    fontFamily: "serif",
    fontSize: 39,
    lineHeight: 43,
    fontWeight: "600",
  },
  titleAccent: {
    color: "#244735",
    fontStyle: "italic",
  },
  subtitle: {
    color: "#737C75",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 12,
    maxWidth: 350,
  },
  loadingBox: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  loadingText: {
    color: "#718172",
    fontSize: 12,
  },
  selectedSection: {
    marginBottom: 22,
  },
  sectionLabel: {
    color: "#718172",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.8,
    marginBottom: 12,
  },
  promptCard: {
    backgroundColor: "rgba(255,255,255,0.78)",
    borderRadius: 18,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E4E8E1",
    position: "relative",
  },
  promptQuestion: {
    color: "#718172",
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 6,
  },
  promptAnswer: {
    color: "#20382B",
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 21,
    paddingRight: 30,
  },
  removeBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(20,30,24,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  removeText: {
    color: "#244735",
    fontSize: 20,
    lineHeight: 22,
  },
  availableSection: {
    marginBottom: 20,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.72)",
    borderWidth: 1,
    borderColor: "transparent",
  },
  chipDisabled: {
    backgroundColor: "#E8EDE6",
    opacity: 0.6,
  },
  chipPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.97 }],
  },
  chipText: {
    color: "#5F6961",
    fontSize: 12,
    fontWeight: "600",
  },
  chipTextDisabled: {
    color: "#9AA19B",
  },
  bottomSection: {
    paddingTop: 10,
    paddingBottom: 9,
  },
  continueButton: {
    height: 58,
    borderRadius: 29,
    overflow: "hidden",
  },
  gradientButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  continueText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  arrowCircle: {
    position: "absolute",
    right: 7,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#D7E2D3",
    alignItems: "center",
    justifyContent: "center",
  },
  arrow: {
    color: "#244735",
    fontSize: 22,
    fontWeight: "700",
  },
  bottomText: {
    color: "#9AA19B",
    fontSize: 9.5,
    textAlign: "center",
    marginTop: 9,
  },
  pressed: {
    opacity: 0.72,
  },
  buttonPressed: {
    opacity: 0.84,
    transform: [{ scale: 0.98 }],
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(25, 42, 32, 0.38)",
  },
  modalContainer: {
    backgroundColor: "#F8F3E9",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 36 : 28,
  },
  modalHandle: {
    alignSelf: "center",
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#C7CEC7",
    marginBottom: 22,
  },
  modalEyebrow: {
    color: "#718172",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: 8,
  },
  modalTitle: {
    color: "#20382B",
    fontFamily: "serif",
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "600",
    marginBottom: 18,
  },
  answerInput: {
    minHeight: 110,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.82)",
    borderWidth: 1,
    borderColor: "#E4E7E1",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    color: "#294433",
    fontSize: 15,
    textAlignVertical: "top",
  },
  charCount: {
    color: "#9AA19B",
    fontSize: 11,
    textAlign: "right",
    marginTop: 6,
    marginBottom: 16,
  },
  saveButton: {
    height: 54,
    borderRadius: 27,
    backgroundColor: "#244735",
    alignItems: "center",
    justifyContent: "center",
  },
  saveText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
});