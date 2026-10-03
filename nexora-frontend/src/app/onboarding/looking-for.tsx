import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  setSelectedLookingFor,
  LookingForOption,
} from "../../lib/lookingForStore";

const { width } = Dimensions.get("window");
const isSmallDevice = width < 380;

const OPTIONS: (LookingForOption & {
  icon: string;
  iconBg: string;
})[] = [
  {
    id: "long-term",
    title: "Long-term relationship",
    subtitle: "Ready for something serious and lasting",
    icon: "♥",
    iconBg: "#F7E0D0",
  },
  {
    id: "long-open",
    title: "Long-term, open to short",
    subtitle: "Want something real, but not rushing",
    icon: "∞",
    iconBg: "#E3EBDD",
  },
  {
    id: "short-open",
    title: "Short-term, open to long",
    subtitle: "Keeping it casual, but open to more",
    icon: "✦",
    iconBg: "#F2E3CF",
  },
  {
    id: "short-fun",
    title: "Short-term fun",
    subtitle: "Here for good times, no labels",
    icon: "☼",
    iconBg: "#F4DDD2",
  },
  {
    id: "unsure",
    title: "Still figuring it out",
    subtitle: "Not sure what I want yet",
    icon: "⌁",
    iconBg: "#E6EBDD",
  },
  {
    id: "friends",
    title: "New friends",
    subtitle: "Looking to expand my circle",
    icon: "◡",
    iconBg: "#F0E2D3",
  },
];

const MAX_SELECT = 3;

export default function LookingForScreen() {
  const [selected, setSelected] = useState<LookingForOption[]>([]);

  const toggleOption = (option: LookingForOption) => {
    const already = selected.find((item) => item.id === option.id);

    if (already) {
      setSelected((prev) => prev.filter((item) => item.id !== option.id));
      return;
    }

    if (selected.length >= MAX_SELECT) return;
    setSelected((prev) => [...prev, option]);
  };

  const handleContinue = () => {
    if (selected.length === 0) return;

    setSelectedLookingFor(selected);
    console.log(
      "🔥 LOOKING FOR SELECTED:",
      selected.map((item) => item.title),
    );
    router.push("/onboarding/preview");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <LinearGradient
        colors={["#FBF7EE", "#F6F0E4", "#EDF2EA"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Decorative Nexora background shapes */}
        <View style={styles.topBlob} />
        <View style={styles.bottomBlob} />
        <View style={styles.peachBlob} />
        <View style={styles.leafClusterTop} pointerEvents="none">
          <View style={[styles.leaf, styles.leafA]} />
          <View style={[styles.leaf, styles.leafB]} />
          <View style={[styles.leaf, styles.leafC]} />
        </View>
        <View style={styles.leafClusterBottom} pointerEvents="none">
          <View style={[styles.leaf, styles.leafD]} />
          <View style={[styles.leaf, styles.leafE]} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            {/* Top navigation */}
            <View style={styles.topBar}>
              <Pressable
                onPress={() => router.back()}
                hitSlop={12}
                style={({ pressed }) => [
                  styles.backButton,
                  pressed && styles.backButtonPressed,
                ]}
              >
                <Text style={styles.backArrow}>‹</Text>
              </Pressable>

              <View style={styles.brandWrap}>
                <View style={styles.logoMark}>
                  <View style={styles.logoGreen} />
                  <View style={styles.logoPeach} />
                  <View style={styles.logoHeartCut} />
                </View>
                <Text style={styles.brand}>Nexora</Text>
              </View>

              <Text style={styles.stepText}>4 of 10</Text>
            </View>

            {/* Progress */}
            <View style={styles.progressRow}>
              {Array.from({ length: 10 }).map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.progressSegment,
                    index < 4 && styles.progressSegmentActive,
                  ]}
                />
              ))}
            </View>

            {/* Intro */}
            <View style={styles.intro}>
              <Text style={styles.kicker}>NICE TO KNOW</Text>
              <Text style={styles.title}>
                What are you{"\n"}
                <Text style={styles.titleAccent}>looking for?</Text>
              </Text>
              <Text style={styles.subtitle}>
                Select up to 3. We&apos;ll use this to connect you with people
                looking for the same kind of connection.
              </Text>
            </View>

            {/* Selection count */}
            <View style={styles.metaRow}>
              <View style={styles.countPill}>
                <View style={styles.countDot} />
                <Text style={styles.countText}>
                  {selected.length === 0
                    ? "Choose your connection"
                    : `${selected.length} of ${MAX_SELECT} selected`}
                </Text>
              </View>

              <Text style={styles.tapHint}>Tap to select</Text>
            </View>

            {/* Options */}
            <View style={styles.options}>
              {OPTIONS.map((option) => {
                const isSelected = selected.some(
                  (item) => item.id === option.id,
                );
                const disabled = !isSelected && selected.length >= MAX_SELECT;

                return (
                  <Pressable
                    key={option.id}
                    onPress={() => toggleOption(option)}
                    disabled={disabled}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: isSelected, disabled }}
                    style={({ pressed }) => [
                      styles.optionCard,
                      isSelected && styles.optionCardSelected,
                      disabled && styles.optionCardDisabled,
                      pressed && !disabled && styles.optionPressed,
                    ]}
                  >
                    <View
                      style={[
                        styles.optionIcon,
                        { backgroundColor: option.iconBg },
                        isSelected && styles.optionIconSelected,
                      ]}
                    >
                      <Text style={styles.optionIconText}>{option.icon}</Text>
                    </View>

                    <View style={styles.optionContent}>
                      <View style={styles.titleRow}>
                        <Text
                          style={[
                            styles.optionTitle,
                            isSelected && styles.optionTitleSelected,
                          ]}
                          numberOfLines={2}
                        >
                          {option.title}
                        </Text>
                        {isSelected && (
                          <View style={styles.selectedBadge}>
                            <Text style={styles.selectedBadgeText}>✓</Text>
                          </View>
                        )}
                      </View>
                      <Text
                        style={[
                          styles.optionSubtitle,
                          isSelected && styles.optionSubtitleSelected,
                        ]}
                        numberOfLines={2}
                      >
                        {option.subtitle}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.radio,
                        isSelected && styles.radioSelected,
                      ]}
                    >
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                  </Pressable>
                );
              })}
            </View>

            {/* Reassurance */}
            <View style={styles.reassurance}>
              <View style={styles.reassuranceIcon}>
                <Text style={styles.reassuranceIconText}>♡</Text>
              </View>
              <View style={styles.reassuranceCopy}>
                <Text style={styles.reassuranceTitle}>No pressure.</Text>
                <Text style={styles.reassuranceText}>
                  You can change your choice anytime from your profile.
                </Text>
              </View>
            </View>

            {/* Continue */}
            <Pressable
              onPress={handleContinue}
              disabled={selected.length === 0}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.continueButton,
                selected.length === 0 && styles.continueDisabled,
                pressed && selected.length > 0 && styles.buttonPressed,
              ]}
            >
              <LinearGradient
                colors={
                  selected.length > 0
                    ? ["#1B5540", "#123C2D"]
                    : ["#CDD4CC", "#CDD4CC"]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.continueGradient}
              >
                <Text
                  style={[
                    styles.continueText,
                    selected.length === 0 && styles.continueTextDisabled,
                  ]}
                >
                  {selected.length === 0 ? "Select an option" : "Continue"}
                </Text>
                <View style={styles.buttonArrowCircle}>
                  <Text
                    style={[
                      styles.arrow,
                      selected.length === 0 && styles.arrowDisabled,
                    ]}
                  >
                    →
                  </Text>
                </View>
              </LinearGradient>
            </Pressable>

            <Text style={styles.footerText}>
              Real people • Meaningful connections • A better you
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FBF7EE",
  },

  gradient: {
    flex: 1,
    overflow: "hidden",
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 22,
  },

  container: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },

  /* Background decoration */
  topBlob: {
    position: "absolute",
    width: 220,
    height: 180,
    borderBottomRightRadius: 130,
    borderBottomLeftRadius: 90,
    backgroundColor: "rgba(208,221,204,0.36)",
    top: -105,
    left: -65,
    transform: [{ rotate: "-8deg" }],
  },

  bottomBlob: {
    position: "absolute",
    width: 210,
    height: 180,
    borderTopLeftRadius: 130,
    borderTopRightRadius: 90,
    backgroundColor: "rgba(213,226,211,0.28)",
    bottom: -110,
    right: -55,
    transform: [{ rotate: "8deg" }],
  },

  peachBlob: {
    position: "absolute",
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "rgba(240,190,160,0.20)",
    top: 8,
    right: -48,
  },

  leafClusterTop: {
    position: "absolute",
    top: 4,
    right: -18,
    width: 135,
    height: 120,
  },

  leafClusterBottom: {
    position: "absolute",
    bottom: 0,
    left: -20,
    width: 125,
    height: 110,
  },

  leaf: {
    position: "absolute",
    width: 24,
    height: 48,
    borderTopLeftRadius: 24,
    borderBottomRightRadius: 24,
    backgroundColor: "rgba(30,78,58,0.15)",
  },

  leafA: { right: 26, top: 10, transform: [{ rotate: "38deg" }] },
  leafB: { right: 2, top: 33, transform: [{ rotate: "74deg" }] },
  leafC: { right: 40, top: 54, transform: [{ rotate: "8deg" }] },
  leafD: { left: 18, bottom: 24, transform: [{ rotate: "-56deg" }] },
  leafE: { left: 42, bottom: 8, transform: [{ rotate: "-26deg" }] },

  /* Header */
  topBar: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.58)",
    borderWidth: 1,
    borderColor: "rgba(31,73,55,0.08)",
  },

  backButtonPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.85,
  },

  backArrow: {
    color: "#174D3A",
    fontSize: 32,
    lineHeight: 32,
    fontWeight: "300",
    marginTop: -3,
  },

  brandWrap: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 7,
  },

  logoMark: {
    width: 26,
    height: 30,
    position: "relative",
  },

  logoGreen: {
    position: "absolute",
    width: 14,
    height: 20,
    borderTopLeftRadius: 14,
    borderBottomRightRadius: 14,
    backgroundColor: "#1E5A42",
    left: 1,
    top: 3,
    transform: [{ rotate: "-28deg" }],
  },

  logoPeach: {
    position: "absolute",
    width: 14,
    height: 20,
    borderTopLeftRadius: 14,
    borderBottomRightRadius: 14,
    backgroundColor: "#F0A987",
    right: 1,
    top: 3,
    transform: [{ rotate: "28deg" }],
  },

  logoHeartCut: {
    position: "absolute",
    width: 10,
    height: 11,
    backgroundColor: "#FBF7EE",
    borderRadius: 5,
    left: 8,
    top: 8,
  },

  brand: {
    color: "#183E30",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  stepText: {
    color: "#65726A",
    fontSize: 13,
    fontWeight: "700",
    minWidth: 44,
    textAlign: "right",
  },

  progressRow: {
    flexDirection: "row",
    gap: 5,
    marginTop: 10,
  },

  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: 3,
    backgroundColor: "#DFE3DC",
  },

  progressSegmentActive: {
    backgroundColor: "#1A5540",
  },

  /* Intro */
  intro: {
    marginTop: 27,
  },

  kicker: {
    fontSize: 10,
    letterSpacing: 2.4,
    fontWeight: "800",
    color: "#B68556",
    marginBottom: 8,
  },

  title: {
    color: "#183E30",
    fontSize: isSmallDevice ? 33 : 36,
    lineHeight: isSmallDevice ? 39 : 42,
    fontWeight: "800",
    letterSpacing: -0.8,
  },

  titleAccent: {
    fontStyle: "italic",
    color: "#285241",
  },

  subtitle: {
    marginTop: 11,
    color: "#6B756E",
    fontSize: 14,
    lineHeight: 21,
    maxWidth: 350,
  },

  /* Meta */
  metaRow: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  countPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#E9F0E8",
  },

  countDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#C58B62",
    marginRight: 7,
  },

  countText: {
    color: "#315344",
    fontSize: 12,
    fontWeight: "700",
  },

  tapHint: {
    color: "#939A94",
    fontSize: 11,
    fontWeight: "600",
  },

  /* Option cards */
  options: {
    marginTop: 12,
    gap: 10,
  },

  optionCard: {
    minHeight: 84,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.82)",
    borderWidth: 1,
    borderColor: "#E6E2D8",
    shadowColor: "#173C2E",
    shadowOpacity: 0.045,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },

  optionCardSelected: {
    backgroundColor: "#F2F7F0",
    borderColor: "#D59C77",
    borderWidth: 1.5,
  },

  optionCardDisabled: {
    opacity: 0.42,
  },

  optionPressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.92,
  },

  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  optionIconSelected: {
    borderWidth: 1,
    borderColor: "rgba(34,80,59,0.10)",
  },

  optionIconText: {
    color: "#1E5741",
    fontSize: 24,
    fontWeight: "700",
  },

  optionContent: {
    flex: 1,
    paddingRight: 7,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  optionTitle: {
    flex: 1,
    color: "#244536",
    fontSize: 15.2,
    lineHeight: 19,
    fontWeight: "800",
  },

  optionTitleSelected: {
    color: "#153E2E",
  },

  selectedBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1B5540",
    marginLeft: 6,
  },

  selectedBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },

  optionSubtitle: {
    marginTop: 4,
    color: "#7B837D",
    fontSize: 12.1,
    lineHeight: 17,
  },

  optionSubtitleSelected: {
    color: "#5D6F63",
  },

  radio: {
    width: 25,
    height: 25,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: "#BCC4BC",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 3,
  },

  radioSelected: {
    borderColor: "#1A5540",
  },

  radioInner: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: "#1A5540",
  },

  /* Reassurance */
  reassurance: {
    marginTop: 14,
    borderRadius: 18,
    paddingHorizontal: 13,
    paddingVertical: 11,
    backgroundColor: "rgba(245,224,207,0.60)",
    borderWidth: 1,
    borderColor: "rgba(211,158,124,0.22)",
    flexDirection: "row",
    alignItems: "center",
  },

  reassuranceIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#FFF5EA",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  reassuranceIconText: {
    color: "#C2815E",
    fontSize: 20,
    marginTop: -1,
  },

  reassuranceCopy: {
    flex: 1,
  },

  reassuranceTitle: {
    color: "#2B493A",
    fontSize: 12.5,
    fontWeight: "800",
    marginBottom: 1,
  },

  reassuranceText: {
    color: "#777C76",
    fontSize: 11.2,
    lineHeight: 16,
  },

  /* Continue */
  continueButton: {
    marginTop: 15,
    borderRadius: 19,
    overflow: "hidden",
    shadowColor: "#123C2D",
    shadowOpacity: 0.13,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 7 },
    elevation: 4,
  },

  continueDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },

  continueGradient: {
    minHeight: 56,
    paddingHorizontal: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  continueText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.1,
  },

  continueTextDisabled: {
    color: "#7A817C",
  },

  buttonArrowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginLeft: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.13)",
  },

  arrow: {
    color: "#FFFFFF",
    fontSize: 19,
    lineHeight: 20,
    fontWeight: "500",
    marginTop: -1,
  },

  arrowDisabled: {
    color: "#8A908A",
  },

  buttonPressed: {
    transform: [{ scale: 0.985 }],
  },

  footerText: {
    textAlign: "center",
    marginTop: 12,
    color: "#9A9D97",
    fontSize: 9.5,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
});
