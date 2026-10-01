import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PreferencesScreen() {
  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <LinearGradient
        colors={["#F8F3E9", "#F4EBDD", "#E8EFE6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      >
        {/* Decorative Background */}
        <View style={styles.topCircle} />
        <View style={styles.bottomCircle} />

        {/* Header */}
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

          <View style={styles.progressContainer}>
            <View style={styles.progressActive} />
            <View style={styles.progressActive} />
            <View style={styles.progressInactive} />
          </View>

          <View style={styles.headerSpacer} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.eyebrow}>
            LET'S GET TO KNOW YOU
          </Text>

          <Text style={styles.title}>
            Your{" "}
            <Text style={styles.titleAccent}>preferences.</Text>
          </Text>

          <Text style={styles.subtitle}>
            Tell us a little about who you are and
            {"\n"}
            who you'd like to meet.
          </Text>

          {/* Temporary Option Cards */}
          <View style={styles.card}>
            <View style={styles.iconCircle}>
              <Text style={styles.icon}>✦</Text>
            </View>

            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Gender</Text>
              <Text style={styles.cardSubtitle}>
                Choose how you'd like to identify
              </Text>
            </View>

            <Text style={styles.chevron}>›</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.iconCircle}>
              <Text style={styles.icon}>♡</Text>
            </View>

            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Looking for</Text>
              <Text style={styles.cardSubtitle}>
                Tell us who you'd like to connect with
              </Text>
            </View>

            <Text style={styles.chevron}>›</Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>i</Text>

            <Text style={styles.infoText}>
              Your preferences help us create a more
              meaningful discovery experience.
            </Text>
          </View>
        </View>

        {/* Bottom */}
        <View style={styles.bottomSection}>
          <Pressable
            onPress={() => {}}
            style={({ pressed }) => [
              styles.continueButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.continueText}>
              Continue
            </Text>

            <View style={styles.arrowCircle}>
              <Text style={styles.arrow}>→</Text>
            </View>
          </Pressable>

          <Text style={styles.stepText}>2 of 3</Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F3E9",
  },

  background: {
    flex: 1,
    paddingHorizontal: 24,
    overflow: "hidden",
  },

  topCircle: {
    position: "absolute",
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: "rgba(190, 211, 190, 0.22)",
    top: -120,
    right: -100,
  },

  bottomCircle: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(226, 177, 138, 0.13)",
    bottom: -90,
    left: -100,
  },

  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.58)",
    alignItems: "center",
    justifyContent: "center",
  },

  backArrow: {
    color: "#244735",
    fontSize: 34,
    lineHeight: 36,
    fontWeight: "300",
    marginTop: -4,
  },

  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  progressActive: {
    width: 28,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#244735",
  },

  progressInactive: {
    width: 7,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#CBD5CB",
  },

  headerSpacer: {
    width: 42,
  },

  content: {
    flex: 1,
    paddingTop: 45,
  },

  eyebrow: {
    color: "#718172",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: 10,
  },

  title: {
    color: "#20382B",
    fontFamily: "serif",
    fontSize: 40,
    lineHeight: 44,
    fontWeight: "600",
  },

  titleAccent: {
    color: "#244735",
    fontStyle: "italic",
  },

  subtitle: {
    marginTop: 13,
    color: "#6E786F",
    fontSize: 13,
    lineHeight: 20,
  },

  card: {
    marginTop: 24,
    minHeight: 78,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.68)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
  },

  cardContent: {
    flex: 1,
    marginLeft: 13,
  },

  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: "#DCE6D8",
    alignItems: "center",
    justifyContent: "center",
  },

  icon: {
    color: "#244735",
    fontSize: 20,
  },

  cardTitle: {
    color: "#244735",
    fontSize: 15,
    fontWeight: "700",
  },

  cardSubtitle: {
    color: "#7A817B",
    fontSize: 11,
    marginTop: 3,
  },

  chevron: {
    color: "#718172",
    fontSize: 28,
    fontWeight: "300",
  },

  infoBox: {
    marginTop: 18,
    borderRadius: 18,
    padding: 14,
    backgroundColor: "rgba(220,230,216,0.48)",
    flexDirection: "row",
    alignItems: "flex-start",
  },

  infoIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#244735",
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 20,
    fontSize: 12,
    fontWeight: "700",
  },

  infoText: {
    flex: 1,
    marginLeft: 10,
    color: "#68736A",
    fontSize: 11,
    lineHeight: 17,
  },

  bottomSection: {
    paddingTop: 18,
    paddingBottom: 10,
  },

  continueButton: {
    height: 58,
    borderRadius: 29,
    backgroundColor: "#244735",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },

  continueText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
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
    fontSize: 23,
    fontWeight: "600",
  },

  stepText: {
    textAlign: "center",
    marginTop: 9,
    color: "#9A9F9B",
    fontSize: 10,
  },

  pressed: {
    opacity: 0.7,
  },

  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});